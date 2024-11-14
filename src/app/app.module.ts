import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AudioRecorderComponent } from './audio-recorder/audio-recorder.component';
import { NgModule } from '@angular/core';
//import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
//import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent,
    AudioRecorderComponent,
  ],
  imports: [BrowserModule,HttpClientModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
   // MediaCapture,
    //AndroidPermissions,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
