import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavigationExtras } from '@angular/router';

import { IonRouterOutlet  , ModalController, NavController, ToastController} from '@ionic/angular';
import { CartComponent } from '../cart/cart.component';
import { LoginComponent } from '../login/login.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // ATTRIBUTS

  produits: any = [];
  formules: any = [];

  cart: any = [];
  adress: string = undefined;

  private contentHeightProduits: number;

  formulesDidLoad: boolean = true;
  ProduitsDidLoad: boolean = true;

  connected: boolean;
  private opened: any;
  openToast: any;

  constructor(private afDB: AngularFireDatabase, 
    private modalCtrl: ModalController, 
    private routerOutlet: IonRouterOutlet,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    public afAuth: AngularFireAuth,
    private afSG: AngularFireStorage) {
      this.afAuth.authState.subscribe(auth => {
        if(!auth){
          this.connected = false;
          this.openLogin(false);      
        } else {
          this.connected = true;
          this.connectToast(auth.email);
        }
      });
      this.getProduitsFromFirebase();
      this.getFormulesFromFirebase();
      this.isOpened();
  }

  //GETTER
  public getCart(): any {return this.cart;}

  //SETTER
  public setCart(cart: any): void {this.cart = cart;}
  public setQuantite(index: string, value: number){this.cart[index].quantite = value;}

  //ADD
  public add(item: any){this.cart.push(item);}

  /**
   * Dirige l'utilisateur vers une autre page qui affichera des infos sur un item
   * @param item l'item que l'on veut afficher
   */
  goTo(item:any) {
    let navData: NavigationExtras = {
      queryParams: {
        item: item,
        home: this,
      }
    }
    this.navCtrl.navigateForward("item", navData);
  }

  /**
   * agit sur l'element content en fonction du scroll
   * @param ev l'event scroll
   */
  onScrolling(ev){
    this.contentHeightProduits = document.getElementById('produits').offsetHeight;
    if(ev.target.scrollTop >= 100){
      document.querySelector('#produits-top').setAttribute('style', 'opacity: 1;');
    } 
    else {
      document.querySelector('#produits-top').removeAttribute('style');
    }
    if(ev.target.scrollTop >= (this.contentHeightProduits + 35)){
      if((ev.target.scrollTop-(this.contentHeightProduits + 35)) < 50){
        document.getElementById('selected-span').setAttribute('style', 'left: ' + (ev.target.scrollTop - (this.contentHeightProduits + 35)) + "% !important");
      } else {
        document.getElementById('selected-span').setAttribute('style', 'left: 50% !important');
      }
    } else {
      document.getElementById('selected-span').removeAttribute('style');
    }
  }

  /**
   * Effectue un scroll "smouth" jusqu'au top de la liste des produits
   */
  scrollToProduits(){
    document.getElementById('content').scrollTo({
      top: 100,
      left: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Effectue un scroll "smouth" jusqu'au top de la liste des formules
   */
  scrollToFormule(){
    document.getElementById('content').scrollTo({
      top: this.contentHeightProduits = document.getElementById('produits').offsetHeight + 90,
      left: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Envoie l'utlisateur sur la page de profil
   */
  goToProfil(){
    if(!this.connected){
      this.openLogin(true);
    } else {
      this.navCtrl.navigateForward("profil");
    }
  }

  /**
   * Envoie l'utlisateur sur la page a propos
   */
  goToAbout(){
    this.navCtrl.navigateForward("about");
  }

  //MODALS
  async openCart() {
    const modal = await this.modalCtrl.create({
      component: CartComponent,
      componentProps: {
        cart: this,
        userAdress: this.adress,
      },
      cssClass: 'card-modal',
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    })

    if(this.connected){
      modal.onWillDismiss().then((data: any) => {
        this.adress = data.data.adress;
      }).catch(() => {
        this.adress = undefined;
      });
      return await modal.present();
    } else {
      this.openLogin(false);
    }
  }

  /**
   * Ouvre un modal permettant de se connecter a un compte si l'utilisateur n'est actuelement pas connecte
   * Redirige l'utlisateur vers la page profil si le modal s'est declancher en apuyant sur le bouton du profil
   * @param byProfil est a true si le bouton profil est a l'origine de l'ouverture 
   */
  async openLogin(byProfil: boolean){
    const modal = await this.modalCtrl.create({
      component: LoginComponent,
      componentProps: {
        openedByProfil: byProfil,
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    })

    modal.onDidDismiss().then((data: any) => {
      if(data.data != undefined){
        if(data.data.openedByProfil){
          if(this.connected){
            this.goToProfil();
          }
        }
      }
    });

    return await modal.present();
  }

  /**
   * Ouvre un modal affichant un message d'erreur
   * @param content le contenu de l'erreur
   * @returns un promise modal 
   */
  async openErrorModal(content: string){
    const modal = await this.modalCtrl.create({
      component: ErrorModalComponent,
      componentProps: {
        content: content,
      },
      mode: 'ios',
      swipeToClose: true,
      cssClass: 'popup-modal-css logout',
    });

    return await modal.present();
  }

  //TOASTS
  async validToast(item: string){
    const toast = await this.toastCtrl.create({
      message: item + ' ajouté au panier',
      duration: 2000,
      color: 'dark',
    })
    toast.present();
  }

  async closedToast(){
    const toast = await this.toastCtrl.create({
      message: "On est actuellement fermé. Rdv à 18h!",
      color: 'dark',
    });

    return await toast.present();
  }

  /**
   * Informe l'utilisateur qu'il est bien connecte et affiche le compte auquel il est connecte
   * @param user l'identifiant de l'utilisateur
   * @returns une promise de toast
   */
  async connectToast(user: string) {
    const toast = await this.toastCtrl.create({
      message: 'Connecté en tant que <strong>' + user + '</strong>',
      duration: 2000,
      color: 'light',
      position: 'top',
    });
    return await toast.present();
  }

  /**
   * 
   * @param item l'item a ajouter au panier
   * @param qte la quantite de produit a ajouter
   */
  addToCard(item: any, qte: number){
    if(this.connected){
      if(this.opened){
        if(this.cart.length == 0){
          this.cart.push({
            item: item,
            quantite: qte
          });
        }
        else {
          let isAlreadyhere = false;
        
          for(let p of Object.keys(this.cart)){
            if(this.cart[p].item.title == item.title){
              this.cart[p].quantite = this.cart[p].quantite + qte;
              isAlreadyhere = true;
            }
          }
  
          if(!isAlreadyhere){
            this.cart.push({
              item: item,
              quantite: qte
            });
          }
        }
        this.validToast(item.title);
      } else {
        this.openErrorModal("On est actuellement fermé. Rdv à 18h!"); 
      }
    } else {
      this.openLogin(false);
    } 
  }

  /**
   * Retourne la quantite de produits dans le panier
   * @returns q la quantite du panier
   */
  getQuantiteCart(): number {
    let q: number = 0;
    for(let c of Object.keys(this.cart)){
      q = q + this.cart[c].quantite;
    }
    return q;
  }

  // FORMULES AND PRODUITS FROM FIREBASE

  /**
   * Recupere les produits de la BDD
   */
  getProduitsFromFirebase(){
    this.afDB.list('produits').snapshotChanges(['child_added', 'child_removed', 'child_changed']).subscribe(actions => {
      this.produits = [];
      actions.forEach(action => {
        let item = action.payload.exportVal();
        this.produits.push({
          key: action.key,
          title: item.name,
          price: item.price,
          quantite: item.stock
        });
        this.getImagesFromStorage(this.produits[this.produits.length - 1], item);
      });
      document.getElementById('swipe-content').setAttribute('style', 'height: auto');
      this.ProduitsDidLoad = false;
    });
  }

  /**
   * Recupere les formules de la BDD
   */
  getFormulesFromFirebase(){
    this.afDB.list('formules/').snapshotChanges(['child_added', 'child_removed', 'child_changed']).subscribe(actions => {
      this.formules = [];
      actions.forEach(action => {
        let formule = action.payload.exportVal();
        this.formules.push({
          key: action.key,
          title: formule.name,
          price: formule.price,
          disponible: formule.disponible,
          formuleContent: formule.formuleContent
        });        
      });
      this.formulesDidLoad = false;
    });
  }

  /**
   * Recupere l'image d'un produit ou d'une formule de la BDD (Storage) puis la glisse dans le tableau de la categorie
   * @param tab l'element rajoute dont il manque l'image
   * @param item les infos de l'item permettant la recuperation de l'image
   */
  getImagesFromStorage(tab: any, item: any){
    const img_ref = item.img_ref;
    this.afSG.ref(img_ref).getDownloadURL().subscribe(imgUrl => {
      tab.img = imgUrl;
    },
    err => {
      console.log(err);
    });
  }

  /**
   * Verifie si le store est ouvert ou ferme en checkant la valeur "open" de la BDD
   */
  isOpened(){
    this.afDB.object('open').valueChanges().subscribe(bool => {
      if(!bool){
        this.cart = [];
        this.openErrorModal("On est actuellement fermé. Rdv à 18h!");
        this.closedToast();
      }
      this.toastCtrl.dismiss().catch(err => {
        console.log(err);
      });
      this.opened = bool;
    });
  }

}
 