import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

// IONIC COMPONENT
import { ModalController } from '@ionic/angular';
import { ErrorModalComponent } from '../error-modal/error-modal.component';

import { HomePage } from '../home/home.page';
import { UpdateValueModalComponent } from '../profil/update-value-modal/update-value-modal.component';
import { ExtrasModalComponent } from './extras-modal/extras-modal.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {

  @Input() cart: HomePage;

  empty: boolean = true;
  subTotal: number = 0;

  userId: string;
  @Input() userAdress: any;

  constructor(
    private modalCtrl: ModalController, 
    private afDB: AngularFireDatabase,
    private afAuth: AngularFireAuth,
  ) { }

  ngOnInit() {
    this.isEmpty();
    this.afAuth.authState.subscribe(user => {
      this.userId = user.uid;
      if(this.userAdress == undefined){
        this.afDB.object('users/' + user.uid + '/adress/').valueChanges().subscribe(adress => {
          this.userAdress = adress;
        });
      }
    });
  }

  private isEmpty(): void {
    if(this.cart.getCart().length > 0){
      this.empty = false;
      this.getSubTotal();
    } else {
      this.empty = true;
    }
  }

  async openItemModal(item: any){
    const modal = await this.modalCtrl.create({
      component: ItemDetailComponent,
      componentProps: {
        item: item,
      },
      swipeToClose: true,
      presentingElement: await this.modalCtrl.getTop(),
    })

    modal.onWillDismiss().then((data: any) => {
      if(data.data.action == 'delete'){
        this.delete(item);
      } 
      else {
        item.quantite = data.data.value;
        this.getSubTotal();
      }
    }).catch(() => {
      console.log("Aucune modification.");
    });

    return await modal.present();
  }

  async openExtrasModal(){
    const modal = await this.modalCtrl.create({
      component: ExtrasModalComponent,
      swipeToClose: true,
      presentingElement: await this.modalCtrl.getTop(),
    });

    modal.onWillDismiss().then(data => {
      for(let item of Object.keys(this.cart.getCart())){
        if(this.contains(data.data.itemsToAdd, this.cart.getCart()[item].item)){
          this.cart.setQuantite(item, this.cart.getCart()[item].quantite + 1);
        }
      }
      for(let item of data.data.itemsToAdd){
        if(!this.contains(this.cart.getCart(), item.item)){
          this.cart.add(item);
        }
      }
      this.getSubTotal();
    }).catch(() => {
      console.log("Auncun produits à ajouter au panier.");
    });

    return await modal.present();
  }

  async updateValue(){
    const modal = await this.modalCtrl.create({
      component: UpdateValueModalComponent,
      componentProps: {
        content: 'Nouvelle adresse :',
      },
      cssClass: 'popup-modal-css auth',
      mode: 'ios',
      swipeToClose: true,
    });

    modal.onDidDismiss().then(data => {
      if(data.data.value != undefined){
        this.userAdress = data.data.value;
      }
    }).catch(error =>{
      console.log("Pas de nouvelle adresse rentrée");
    });

    return await modal.present();
  }

  async openErrorModal(content: string){
    const modal = await this.modalCtrl.create({
      component: ErrorModalComponent,
      componentProps: {
        content: content
      },
      mode: "ios",
      cssClass: 'popup-modal-css error-modal-css',
      swipeToClose: true
    })

    return await modal.present();
  }

  contains(tab: any, value: any): boolean{
    for(let item of tab){
      if(item.item.key == value.key){
        return true;
      }
    }
    return false;
  }

  getString(formuleContent: any): String {
    let content: string = "";
    for(let item of Object.keys(formuleContent)){
      if(formuleContent[item] == formuleContent[0]){
        content = formuleContent[item].quantite + " x " + formuleContent[item].title;
      }
      else {
        content = content + " - " + formuleContent[item].quantite + " x " + formuleContent[item].title;
      }
    }
    return content;
  }

  getSubTotal(): void{
    this.subTotal = 0;
    
    for(let item of Object.keys(this.cart.getCart())){
      this.subTotal = this.subTotal + (this.cart.getCart()[item].item.price*this.cart.getCart()[item].quantite);
    }
  }

  delete(item: any) {
    let tmp: any = [];

    for(let c of Object.keys(this.cart.getCart())){
      if(this.cart.getCart()[c] != item){       
        tmp.push(this.cart.getCart()[c]);
      }
    }
    this.cart.setCart(tmp);
    this.isEmpty();
  }

  async close(){
    if(this.userAdress != undefined && this.cart.getCart().length != 0){
      return await this.modalCtrl.dismiss({
        'adress': this.userAdress,
      });
    }
    return await this.modalCtrl.dismiss();
  }

  validateOrder(){
    let order: any = [];
    let error: any = [];
    for(let c of Object.keys(this.cart.getCart())){
      for(let p of Object.keys(this.cart.produits)){
        if(this.cart.getCart()[c].item.key == this.cart.produits[p].key){
          if(this.cart.produits[p].formule){
            if(this.cart.produits[p].disponible){
              order.push({
                produitKey: this.cart.produits[p].key,
              });
            } else {
              error.push("Le produit : " + this.cart.getCart()[c].item.title + " n'est plus disponible.");
            }
          }
          if(this.cart.produits[p].quantite >= this.cart.getCart()[c].quantite){
            order.push({
              produitKey: this.cart.produits[p].key,
              quantite: this.cart.getCart()[c].quantite
            });
          } else {
            error.push("Il ne reste que " + this.cart.produits[p].quantite + " produits " + this.cart.produits[p].title + " en sotck.");
          }

        }
      }
    }
    if(this.userAdress == '' || this.userAdress == undefined){
      error.push("Aucune adresse de livraison n'est indiqué");
    }
    if(error.length != 0){
      this.openErrorModal(error[0]);
    } else {
      this.afDB.list('orders/').push({
        name: this.userId,
        order: order,
        date: new Date().toISOString(),
        adresse: this.userAdress,
        payMode: 'ca$h',
      }).then(() => {
        this.cart.setCart([]),
        this.close();
      })
    }
  }

}
