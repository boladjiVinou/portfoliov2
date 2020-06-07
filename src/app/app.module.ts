import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PresentationComponent} from './sub-sections/presentation/presentation.component';
import {ContactComponent} from './sub-sections/contact/contact.component';
import {ExperienceComponent} from './sub-sections/experience/experience.component';
import {LanguageService} from './services/languageService';

@NgModule({
  declarations: [
    AppComponent,
    PresentationComponent,
    ContactComponent,
    ExperienceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [LanguageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
