import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reauth-modal',
  templateUrl: './reauth-modal.component.html',
  styleUrls: ['./reauth-modal.component.scss'],
})
export class ReauthModalComponent implements OnInit {

  email: string;
  password: string;

  constructor(
    private modalCtrl: ModalController,
    public afAuth: AngularFireAuth,
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      this.email = user.email;
    });
  }

  async close(){
    return await this.modalCtrl.dismiss({
      'password': this.password,
    });
  }

}
