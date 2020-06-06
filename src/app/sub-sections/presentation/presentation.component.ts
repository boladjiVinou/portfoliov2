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
      this.aboutMe.push(`My name is Boladji Vinou, I did my secondary studies in biology and I am currently a student graduating with a bachelor's degree in computer engineering.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`During this program, I learned to program in a procedural and object-oriented way with the C ++ language.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`In addition, some courses allowed me to acquire knowledge in multimedia programming (image or video processing, video games), artificial intelligence, software engineering as well as system programming (embedded systems, parallel systems ).`);
      this.aboutMe.push(`On this site you will be able to learn more about my different achievements.`);
      this.aboutMe.push(`I wish you a good visit.`);
      this.aboutMeTitle = 'About Me';
    } else {
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Je m’appelle Boladji Vinou, je suis un diplome en génie informatique.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Durant ce programme, j’ai acquis de solides bases en programmation procédurale et orientée-objet avec le langage C++.`);
      // tslint:disable-next-line:max-line-length
      this.aboutMe.push(`Cette formation m'a permis d'avoir une idee de l' impact d' une ligne de code sur les ressources de l' ordinateur,`);
      this.aboutMe.push(`elle m ' a aussi permis d' en savoir plus sur des domaines tels que le multimedia, les systemes numeriques, l' infonuagique et l' intelligence artificielle.`);
      this.aboutMe.push(`Sur ce site vous pourrez en apprendre d' avantages sur mes différentes réalisations`);
      // this.aboutMe.push(`Je vous souhaite une bonne visite.`);
      this.aboutMeTitle = 'À propos de moi';
    }
  }
}
