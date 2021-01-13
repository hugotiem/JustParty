import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-extras-modal',
  templateUrl: './extras-modal.component.html',
  styleUrls: ['./extras-modal.component.scss'],
})
export class ExtrasModalComponent implements OnInit {

  extras: any = [];

  private extrasToAddToCart: any = [];

  constructor(
    private afDB: AngularFireDatabase,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.getExtrasFromFirebase();
  }

  async close(){
    if(this.extrasToAddToCart.length != 0){
      return await this.modalCtrl.dismiss({
        'itemsToAdd': this.extrasToAddToCart,
      });
    }
    return await this.modalCtrl.dismiss();
  }

  getExtraToCart(extra: any): any{
    for(let e of Object.keys(this.extrasToAddToCart)){
      if(this.extrasToAddToCart[e].item == extra){
        return this.extrasToAddToCart[e];
      }
    }
    return undefined;
  }

  addToCart(extra: any): void{
    let tmp = this.getExtraToCart(extra);
    if(tmp != undefined){
      tmp.quantite += 1;
    } else {
      this.extrasToAddToCart.push({
        item: extra,
        quantite: 1,
      });
    }
  }

  getQuantite(extra: any): number {
    if(this.getExtraToCart(extra) != undefined){
      return this.getExtraToCart(extra).quantite;
    }
    return undefined;
  }

  getExtrasFromFirebase(){
    this.afDB.list('extras/').snapshotChanges(['child_added', 'child_removed', 'child_changed']).subscribe(actions => {
      this.extras = [];
      actions.forEach(action => {
        let extra = action.payload.exportVal();
        this.extras.push({
          key: action.key,
          title: extra.name,
          price: extra.price,
          quantite: extra.stock
        });   
      });
    })
  }

}
