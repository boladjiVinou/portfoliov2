import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {PresentationComponent} from './sub-sections/presentation/presentation.component';
import {ContactComponent} from './sub-sections/contact/contact.component';
import {ExperienceComponent} from './sub-sections/experience/experience.component';
import {PortfolioComponent} from './sub-sections/portfolio/portfolio.component';
import {ProjectOneComponent} from './sub-sections/portfolio/project-1/project-one.component';
import {SudokuComponent} from './sub-sections/portfolio/sudoku/sudoku.component';
import {CurlingComponent} from './sub-sections/portfolio/curling/curling.component';
import {ChessComponent} from './sub-sections/portfolio/chess/chess.component';

import {LanguageService} from './services/languageService';
import {ProjectOneRendererService} from './sub-sections/portfolio/project-1/project-one-renderer.service';
import {SudokuService} from './sub-sections/portfolio/sudoku/sudoku.service';
import {CurlingService} from './sub-sections/portfolio/curling/curling.service';
import { ChessRenderingService } from './sub-sections/portfolio/chess/classes/rendering/chessrendering.service';

@NgModule({
  declarations: [
    AppComponent,
    PresentationComponent,
    ContactComponent,
    ExperienceComponent,
    PortfolioComponent,
    ProjectOneComponent,
    SudokuComponent,
    CurlingComponent,
    ChessComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [LanguageService, ProjectOneRendererService, SudokuService, CurlingService, ChessRenderingService],
  bootstrap: [AppComponent] // https://getbootstrap.com/
})
export class AppModule { }
