import { Component, OnInit } from '@angular/core';
import {LanguageService} from './services/languageService';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Boladji-portfoliov2';
  workingExperience = 'Expérience';
  constructor(private languageService: LanguageService, private router: Router){

  }
  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.languageService.initLangage(false);
    // this.aboutSelected = true;
    // https://www.techiediaries.com/angular-router-routerlink-navigate-navigatebyurl/
    // this.router.navigateByUrl('about');
  }
  englishButtonChange(event: any) {
    if (event !== undefined) {
      this.languageService.setEnglishLangageState(true);
      this.workingExperience = 'Experience';
    }
  }
  frenchButtonChange(event: any) {
    if (event !== undefined) {
      this.languageService.setEnglishLangageState(false);
      this.workingExperience = 'Expérience';
    }
  }
}
