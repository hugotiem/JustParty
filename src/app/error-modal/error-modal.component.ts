import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent implements OnInit {

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
