import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

// IONIC COMPONENTS
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {

  dataUser: any = {
    name: '',
    surname: '',
    email: '',
    password: '',
  };

  errorMessage: string = '';
  isConnecting: boolean = false;

  private isSignedUp: boolean = false;

  constructor(
    private afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  async close(){
    this.modalCtrl.dismiss({
      'signUp': this.isSignedUp,
    });
  }

  disabledError(id: string){
    if(document.querySelector('#' + id).hasAttribute('class')){
      document.querySelector('#' + id).removeAttribute('class');
    }
  }

  signUp(){
    if(this.dataUser.surname == ''){
      this.errorMessage = "T'as oublié ton nom.";
      if(!document.querySelector('#nom').hasAttribute('class')){
        document.querySelector('#nom').setAttribute("class", "invalid-input");
      }
    }
    else if(this.dataUser.name == ''){
      this.errorMessage = "Fais pas genre t'as pas de prénom.";
      if(!document.querySelector('#prenom').hasAttribute('class')){
        document.querySelector('#prenom').setAttribute("class", "invalid-input");
      }
    }
    else {
      this.isConnecting = true;
      this.errorMessage = '';
      this.afAuth.createUserWithEmailAndPassword(this.dataUser.email, this.dataUser.password).then(user => {
        this.isSignedUp = true;
        this.addUserToFireDatabase(user.user);
        this.dataUser = {
          name: '',
          surname: '',
          email: '',
          password: '',
        };
        this.afAuth.authState.subscribe(user => {
          user.sendEmailVerification().then(() => {

          }).catch(error => {
            console.log(error);
          });
        })
        this.close();
      }).catch((error) => {
        console.log(error);
        if(error.code == "auth/invalid-email"){
          this.errorMessage = "L'adresse e-mail n'est pas valide, fais un effort...";
          if(!document.querySelector('#mail').hasAttribute('class')){
            document.querySelector('#mail').setAttribute("class", "invalid-input");
          }
        }
        if(error.code == "email-already-in-use"){
          this.errorMessage = "L'adresse e-mail est déjà lié à un autre compte.";
          if(!document.querySelector('#mail').hasAttribute('class')){
            document.querySelector('#mail').setAttribute("class", "invalid-input");
          }
        }
        if(error.code == "auth/weak-password"){
          this.errorMessage = "Le mot de passe est trop faible... Mets un truc mieux stp.";
          if(!document.querySelector('#password').hasAttribute('class')){
            document.querySelector('#password').setAttribute("class", "invalid-input");
          }
        }
        this.isConnecting = false;
      });
    }
  }

  addUserToFireDatabase(user: any){
    this.afDB.object('users/' + user.uid).set({
      surname: this.dataUser.surname,
      name: this.dataUser.name,
    });
  }

}
