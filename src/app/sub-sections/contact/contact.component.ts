import { Component, OnInit, NgZone } from '@angular/core';
import {LanguageService} from '../../services/languageService';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  public myProfil = 'Mon profil';
  public phone = 'Numéro de téléphone';
  constructor(private languageService: LanguageService, private zone: NgZone) { }

  ngOnInit() {
    this.languageService.getEnglishLangageState().subscribe((isEnglish: boolean) => {
      this.zone.run(() => this.translate(isEnglish));
    });
  }
  translate(isEnglish: boolean) {
    if (isEnglish) {
      this.myProfil = 'My profil';
      this.phone = 'Phone Number';
    } else {
      this.myProfil = 'Mon profil';
      this.phone = `Numero de téléphone`;
    }
  }

}
