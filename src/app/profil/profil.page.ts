import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { auth } from 'firebase';

// MY OWN COMPONENTS
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { ReauthModalComponent } from './reauth-modal/reauth-modal.component';
import { UpdateValueModalComponent } from './update-value-modal/update-value-modal.component';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {

  dataUser: any = {
    surname: '',
    name: '',
    email: '',
    adress: '',
  }

  verifiedEmailIcon: string;
  color: string;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if(!user){
        this.goBack();
      }
      else {
        this.dataUser.email = user.email;
        this.getUserFromFirebase(user);
        if(!user.emailVerified){
          this.verifiedEmailIcon = "alert";
          this.color = "danger";
        } else {
          this.verifiedEmailIcon = 'checkmark';
          this.color = "";
        }
      }
    });
  }

  logout(){
    this.afAuth.signOut();
  }

  deleteAccount(){
    this.afAuth.authState.subscribe(user => {
      user.delete().then(success => {
        this.goBack();
        this.afDB.object('users/' + user.uid).remove();
      }).catch(error => {
        this.openReauthModal('delete', undefined);
      });
    })
  }

  modifyEmail(value: string){
    this.afAuth.authState.subscribe(user => {
      if(value == user.email){
        this.openErrorModal("Cette adresse email et l'ancienne sont similaires.");
      } else {
        user.updateEmail(value).then(success => {
          this.openSuccessModal('Ton email a bien été changé !');
          user.sendEmailVerification().catch(error => {
            console.log(error);
          });
        }).catch(error => {
          console.log(error);
          if(error.code == "auth/invalid-email"){
            this.openErrorModal('Email invalide.');
          }
          else if(error.code == 'auth/requires-recent-login'){
            this.openReauthModal('email', value);
          }
          else if(error.code = 'auth/email-already-in-use'){
            this.openErrorModal("L'adresse email est déjà associé à un compte.");
          }
        });
      }
    });
  }

  modifyPassword(value: string){
    this.afAuth.authState.subscribe(user => {
      user.updatePassword(value).then(success => {
        this.openSuccessModal('Ton mot de passe a bien été changé !');
      }).catch(error => {
        console.log(error);
        if(error.code == "auth/weak-password"){
          this.openErrorModal('Le mot de passe est trop faible.');
        }
        if(error.code == 'auth/requires-recent-login'){
          this.openReauthModal('password', value);
        }
      });
    });
  }

  goBack(){
    this.navCtrl.pop();
  }

  // ALERTS 

  async updateEmailValue(content: string, type: string){
    let checked: boolean = true;
    this.afAuth.authState.subscribe( async user => {
      if(!user.emailVerified){
        checked = false;
      }
      if(!checked) {
        const alert = await this.alertCtrl.create({
          cssClass: 'my-custom-class',
          header: 'Action',
          message: 'Tu veux vérifier ton adresse ou la modifier ?',
          buttons: [
            {
              text: 'Verifier',
              handler: () => {
                this.afAuth.authState.subscribe(user => {
                  user.sendEmailVerification().then(success => {
                    this.openSuccessModal('Email de vérification envoyé ! Après vérification, recharge l\'appli');
                  }).catch(error => {
                    console.log(error);
                    if(error.code == 'auth/too-many-requests'){
                      this.openErrorModal('Un mail de confirmation a déjà été envoyé à cette adresse email.');
                    }
                  })
                })
              }
            }, {
              text: 'Modifier',
              handler: () => {
                this.updateValue(content, type);
              }
            }
          ],
        });
        await alert.present();
      } else {
        this.updateValue(content, type);
      }
    })
  }

  // MODALS

  async openConfirmModal(type: string, value: string, content: string){
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      componentProps: {
        title: value,
        content: 'Tu veux vraiment ' + content + ' ?',
        buttonValue: value,
      },
      cssClass: 'popup-modal-css logout',
      mode: "ios",
      swipeToClose: true,
    })

    modal.onDidDismiss().then((data: any) => {
      if(data.data != undefined){
        if(data.data.action){
          if(type == 'logout'){
            this.logout();
          }
          else {
            this.deleteAccount();
          }
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
    });

    return await modal.present();
  }

  async openSuccessModal(content: string){
    const modal = await this.modalCtrl.create({
      component: SuccessModalComponent,
      componentProps: {
        content: content,
      },
      mode: 'ios',
      cssClass: 'popup-modal-css error-modal-css',
      swipeToClose: true
    })

    return await modal.present();
  }

  async openReauthModal(type: string, value: string){
    const modal = await this.modalCtrl.create({
      component: ReauthModalComponent,
      mode: 'ios',
      cssClass: 'popup-modal-css auth',
      swipeToClose: true
    })

    modal.onDidDismiss().then((data: any) => {
      if(data.data.password != undefined){
        this.afAuth.authState.subscribe(user => {
          const c = auth.EmailAuthProvider.credential(user.email, data.data.password);
          user.reauthenticateWithCredential(c).then(success => {
            if(type == 'email'){
              this.modifyEmail(value)
            } 
            else if (type == 'password'){
              this.modifyPassword(value);
            }
            else if(type == 'delete'){
              this.deleteAccount();
            }
          }).catch(error => {
            console.log(error);
            this.openErrorModal('Le mot de passe est incorrect.');
          })
        })
      } else{
        this.openErrorModal('Le mot de passe est incorrect.');
      }
    })

    return await modal.present();
  }

  async updateValue(content: string, type: string){

    const modal = await this.modalCtrl.create({
      component: UpdateValueModalComponent,
      componentProps: {
        content: content,
        type: type,
      },
      cssClass: 'popup-modal-css auth',
      mode: 'ios',
      swipeToClose: true,
    });

    modal.onDidDismiss().then((data: any) => {
      if(data.data != undefined){
        if(data.data.value != undefined){
          if(data.data.value == ''){
            console.log('okay')
            this.openErrorModal('Le champs est vide.');
          }
          else if(type == 'email'){
            this.modifyEmail(data.data.value);
          }
          else if (type == 'password'){
            this.modifyPassword(data.data.value);
          } 
          else if (type == 'name') {
            if(this.dataUser.name == data.data.value){
              this.openErrorModal('T\'as écrit le même prénom que celui d\'avant.');
            } else {
              this.afAuth.authState.subscribe(user => {
                this.afDB.object('users/' + user.uid + '/name/').set(data.data.value).then(() => {
                  this.openSuccessModal('Ton prénom a bien été changé !');
                });
              })
            }
          }
          else if (type == 'surname'){
            if(this.dataUser.surname == data.data.value){
              this.openErrorModal('T\'as écrit le même nom que celui d\'avant.');
            } else {
              this.afAuth.authState.subscribe(user => {
                this.afDB.object('users/' + user.uid + '/surname/').set(data.data.value).then(() => {
                  this.openSuccessModal('Ton nom a bien été changé !');
                });;
              })
            }
          }
          else if (type == 'adress'){
            this.afAuth.authState.subscribe(user => {
              this.afDB.object('users/' + user.uid + '/adress/').set(data.data.value).then(() => {
                this.openSuccessModal('Ton adresse a bien été changé !');
              });
            })
          }
        } 
      } 
    });

    return await modal.present();
  }

  getUserFromFirebase(user: any){
    this.afDB.object('users/' + user.uid).snapshotChanges().subscribe(action => {
      this.dataUser.surname = action.payload.exportVal().surname;
      this.dataUser.name = action.payload.exportVal().name;
      this.dataUser.adress = action.payload.exportVal().adress;
    });
  }

  getOrdersFromFirebase(){

  }
}
