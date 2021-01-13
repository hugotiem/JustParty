import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HomePage } from '../home/home.page';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit {

  item: any;
  value: number = 1;

  home: HomePage;

  constructor(private navCtrl: NavController, private route: ActivatedRoute) { 
    this.route.queryParams.subscribe(params => {
      this.item = params['item'];
      this.home = params['home'];
    })
  }

  ngOnInit() {
  }

  add(){
    this.value = this.value + 1;
  }

  remove(){
    if(this.value > 0){
      this.value = this.value - 1;
    }
  }

  addToCart(): void{
    this.home.addToCard(this.item, this.value);
    this.goBack();  
  }

  goBack(){
    this.navCtrl.back();
  }

}
