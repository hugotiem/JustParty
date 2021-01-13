import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent implements OnInit {

  @Input() title: string;
  @Input() buttonValue: string;
  @Input() content: string;
  @Input() email: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  async close(action: boolean) {
    return await this.modalCtrl.dismiss({
      'action': action, 
    })
  }

}
