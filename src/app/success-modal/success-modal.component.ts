import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent implements OnInit {

  @Input() content: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

  }

  async close(){
    return await this.modalCtrl.dismiss();
  }
}
