import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {PresentationComponent} from './sub-sections/presentation/presentation.component';
import {ContactComponent} from './sub-sections/contact/contact.component';
import {ExperienceComponent} from './sub-sections/experience/experience.component';
import {PortfolioComponent} from './sub-sections/portfolio/portfolio.component';
import {ProjectOneComponent} from './sub-sections/portfolio/project-1/project-one.component';

import {LanguageService} from './services/languageService';
import {ProjectOneRendererService} from './sub-sections/portfolio/project-1/project-one-renderer.service';

@NgModule({
  declarations: [
    AppComponent,
    PresentationComponent,
    ContactComponent,
    ExperienceComponent,
    PortfolioComponent,
    ProjectOneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [LanguageService, ProjectOneRendererService],
  bootstrap: [AppComponent]
})
export class AppModule { }
