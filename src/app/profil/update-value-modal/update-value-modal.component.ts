import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-value-modal',
  templateUrl: './update-value-modal.component.html',
  styleUrls: ['./update-value-modal.component.scss'],
})
export class UpdateValueModalComponent implements OnInit {

  @Input() content: string;
  @Input() type: string;
  
  value: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  async close(button: boolean, close: boolean) {
    if((button && this.value==undefined)){
      this.value = '';
    }
    if(close){
      this.value = undefined;
    }
    return await this.modalCtrl.dismiss({
      'value': this.value,
    });
  }

}
