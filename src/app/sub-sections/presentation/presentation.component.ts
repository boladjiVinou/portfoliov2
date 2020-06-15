import { Component, OnInit, OnDestroy, NgZone  } from '@angular/core';
import {LanguageService} from '../../services/languageService';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-presentation',
  templateUrl: 'presentation.component.html',
  styleUrls: ['presentation.component.scss']
})
export class PresentationComponent implements OnInit {
  private langageSubscription: Subscription;
  public aboutMe: string[] = [];
  public aboutMeTitle = '';
  constructor(private languageService: LanguageService, private zone: NgZone){

  }
  ngOnInit(): void {
    this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
        this.zone.run(() => {
          this.changeLangage(value);
        });
    });
  }
  changeLangage(isEnglish: boolean) {
    this.aboutMe = [];
    if (isEnglish) {
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`My name is Boladji Vinou, I am a graduated student in computer engineering.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`In this program, I learnt to program by using C++. I understand object-oriented programming and its concepts.`);
      this.aboutMe.push(`This degree gave me a better understanding of the hardware and software aspects of IT`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`In addition, some courses allowed me to acquire knowledge in multimedia programming (image or video processing, video games), artificial intelligence, software engineering as well as system programming (embedded systems, parallel systems ).`);

      this.aboutMe.push(`On this site (in development) you will be able to learn more about my different achievements.`);
      this.aboutMeTitle = 'About Me';
    } else {
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Je m’appelle Boladji Vinou, je suis un diplomé en génie informatique.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Durant ce programme, j’ai acquis de solides bases en programmation procédurale et orientée-objet avec le langage C++.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Cette formation m'a permis d'avoir une meilleure comprehension des aspects hardware et software de l' informatique,`);
      this.aboutMe.push(`elle m ' a aussi permis d' en savoir plus sur des domaines tels que le multimedia, les systèmes numériques, l' infonuagique et l' intelligence artificielle.`);
      this.aboutMe.push(`Sur ce site (encore en construction) vous pourrez en apprendre d' avantage sur mes différentes réalisations.`);
      this.aboutMeTitle = 'À propos de moi';
    }
  }
}
