import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

// IONIC COMPONENTS
import { ModalController } from '@ionic/angular';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  dataUser: any = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  forgotLink: boolean = false;
  isConnecting: boolean = false;

  @Input() openedByProfil: boolean = false;

  constructor(
    public afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
  ) { 
    
  }

  ngOnInit() {}

  disabledError(id: string){
    if(document.querySelector('#' + id).hasAttribute('class')){
      document.querySelector('#' + id).removeAttribute('class');
    }
  }

  login(){
    this.errorMessage = '';
    this.forgotLink = false;
    this.isConnecting = true;

    this.afAuth.signInWithEmailAndPassword(this.dataUser.email, this.dataUser.password).then(() => {
      this.dataUser = {
        email: '',
        password: ''
      };
      this.close();
    }).catch((error) => {
      if(error.code == "auth/user-not-found" || error.code == "auth/invalid-email"){
        this.errorMessage = "Cette adresse existe pas chez nous frérot";
        if(!document.querySelector('#mail').hasAttribute('class')){
          document.querySelector('#mail').setAttribute("class", "invalid-input");
        }
      }
      if(error.code == "auth/wrong-password"){
        this.errorMessage = "C'est pas le bon mot de passe.";
        if(!document.querySelector('#password').hasAttribute('class')){
          document.querySelector('#password').setAttribute("class", "invalid-input");
          this.forgotLink = true;
        }
      }
      this.isConnecting = false;
    });
  }

  sendPassword(){
    this.afAuth.sendPasswordResetEmail(this.dataUser.email).then(success => {

    }).catch(error => {
      this.openErrorModal("L'adresse email saisie n'existe pas.");
    });
  }

  async openSignUp(){
    const modal = await this.modalCtrl.create({
      component: SignUpComponent,
      cssClass: 'sign-up-modal',
      swipeToClose: true,
      presentingElement: await this.modalCtrl.getTop(),
    })

    modal.onDidDismiss().then((data) => {
      if(data.data != undefined){
        if(data.data.signUp){
          setTimeout(() => {
            this.close();
          }, 100);
        }
      }
    });

    return await modal.present();
  }

  async openConfirmModal(){
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      componentProps: {
        title: 'Envoyer',
        content: "Envoyer l'email de réinitialisation de mot de passe à cette adresse ?",
        buttonValue: 'Envoyer',
        email: this.dataUser.email
      },
      mode: 'ios',
      cssClass: 'popup-modal-css confirm-reset-password',
      swipeToClose: true
    })

    modal.onDidDismiss().then((data: any) => {
      if(data.data != undefined){
        if(data.data.action){
          this.sendPassword();
        }
      }
    })

    return await modal.present();
  }

  async openErrorModal(content: string){
    const modal = await this.modalCtrl.create({
      component: ErrorModalComponent,
      componentProps: {
        content: content,
      },
      mode: 'ios',
      swipeToClose: true,
      cssClass: 'popup-modal-css error-modal-css'
    })

    return await modal.present();
  }

  async close(){
    this.modalCtrl.dismiss({
      'openedByProfil': this.openedByProfil, 
    });
  }

}
