import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfirmModalComponent } from 'src/app/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit {

  @Input() item: any;

  @Input() value: number;

  private action: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.value = this.item.quantite;
  }

  add(){
    this.value = this.value + 1;
  }

  remove(){
    if(this.value > 0){
      this.value = this.value - 1;
    }
  }

  delete(){
    this.action = 'delete';
    this.close();
  }

  updateValue(){
    if(this.value == 0){
      this.openConfirmModal();
    } else {
      this.action = 'update';
      this.close();
    }
  }

  async openConfirmModal(){
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      componentProps: {
        title: 'Supprimer',
        content: 'Voulez-vous supprimer ce produit du panier ?',
        buttonValue: 'Supprimer'
      },
      mode: 'ios',
      cssClass: 'popup-modal-css logout',
      swipeToClose: true,
    })

    modal.onDidDismiss().then((data: any) => {
      if(data != undefined){
        if(data.data.action){
          setTimeout (() => {
            this.delete();
          }, 100)
          this.delete();
        }
      }
    });

    return await modal.present();
  }

  async close(){
    return await this.modalCtrl.dismiss({
      'action': this.action,
      'value': this.value
    });
  }

}
