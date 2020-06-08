import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PresentationComponent} from './sub-sections/presentation/presentation.component';
import {ContactComponent} from './sub-sections/contact/contact.component';
import {ExperienceComponent} from './sub-sections/experience/experience.component';
import {PortfolioComponent} from './sub-sections/portfolio/portfolio.component';

import { BrowserModule } from '@angular/platform-browser';
// import {} from './sub-sections/contact/contact.component';
import { from } from 'rxjs';
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
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
