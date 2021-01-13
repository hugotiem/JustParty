import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

// FIRE#DATABASE
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';

// IONIC COMPONENTS
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// NATIVE COMPONENTS
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// MY OMN COMPONENTS
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ReauthModalComponent } from './profil/reauth-modal/reauth-modal.component';
import { UpdateValueModalComponent } from './profil/update-value-modal/update-value-modal.component';
import { ExtrasModalComponent } from './cart/extras-modal/extras-modal.component';
import { HomePage } from './home/home.page';

export const firebaseConfig = {
  apiKey: 'AIzaSyDobeRP6jeR7DcDAnFCqUiInCnKqYppYqg',
  authDomain: 'konta-95333.firebaseapp.com',
  databaseURL: 'https://konta-95333.firebaseio.com',
  projectId: 'konta-95333',
  storageBucket: 'konta-95333.appspot.com',
  messagingSenderId: '965037121908',
  appId: "1:965037121908:web:11bd109c9315dc4da8cc21",
};

@NgModule({
  declarations: [
    AppComponent,
    CartComponent,
    LoginComponent,
    SignUpComponent,
    ConfirmModalComponent,
    ReauthModalComponent,
    UpdateValueModalComponent,
    ExtrasModalComponent,
  ],
  entryComponents: [],
  imports: [BrowserModule, 
    IonicModule.forRoot(),
      AppRoutingModule,
      FormsModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireDatabaseModule,
      AngularFireStorageModule,
    ],
  providers: [
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    HomePage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
