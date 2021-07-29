import { DownloadAppComponent } from './components/download-app/download-app.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from './material.module';

//FIREBASE
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

//COMPONENTS
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { HomeComponent } from './components/home/home.component';
import { Page404Component } from './components/page404/page404.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { GrouplistComponent } from './components/grouplist/grouplist.component';
import { GroupComponent } from './components/group/group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductGroupListComponent } from './components/product-group-list/product-group-list.component';
import { ProductGroupComponent } from './components/product-group/product-group.component';
import { EmptyListComponent } from './components/empty-list/empty-list.component';
import { ConfirmacionComponent } from './components/confirmacion/confirmacion.component';
import { SelectProductsListComponent } from './components/select-products-list/select-products-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CestasComponent } from './components/cestas/cestas.component';
import { CestaComponent } from './components/cesta/cesta.component';
import { HttpClientModule } from '@angular/common/http';
import { FryptoComponent } from './components/frypto/frypto.component';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent, ToolbarComponent, Page404Component, HomeComponent, SpinnerComponent, GrouplistComponent, GroupComponent, ProductGroupListComponent,
    EmptyListComponent, ConfirmacionComponent, ProductGroupComponent, SelectProductsListComponent, LoginComponent, ProfileComponent, CestasComponent, CestaComponent,
    DownloadAppComponent,
    FryptoComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    MaterialModules,
    AngularFirestoreModule, AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAnalyticsModule,
    FormsModule,
    ReactiveFormsModule, HttpClientModule
  ],
  entryComponents: [],
  providers: [AngularFireAuth, AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule { }
