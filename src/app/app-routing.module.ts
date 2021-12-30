import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PresentationComponent} from './sub-sections/presentation/presentation.component';
import {ContactComponent} from './sub-sections/contact/contact.component';
import {ExperienceComponent} from './sub-sections/experience/experience.component';
import {PortfolioComponent} from './sub-sections/portfolio/portfolio.component';
import {ProjectOneComponent} from './sub-sections/portfolio/project-1/project-one.component';
import {SudokuComponent} from './sub-sections/portfolio/sudoku/sudoku.component';
import {CurlingComponent} from './sub-sections/portfolio/curling/curling.component';
import { ChessComponent } from './sub-sections/portfolio/chess/chess.component';
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [{
  path: '',
  component: PresentationComponent
},
{
  path: '#',
  component: PresentationComponent
},
{
  path: 'contact',
  component: ContactComponent
},

{
  path: 'experience',
  component: ExperienceComponent
}
,

{
  path: 'portfolio',
  component: PortfolioComponent
},
{
  path: 'portfolio/Projet 1',
  component: ProjectOneComponent
}
,
{
  path: 'portfolio/Project 1',
  component: ProjectOneComponent
}
,
{
  path: 'portfolio/Sudoku',
  component: SudokuComponent
},
{
  path: 'portfolio/Curling',
  component: CurlingComponent
},
{
  path: 'portfolio/Chess',
  component: ChessComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
