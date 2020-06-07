import { Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import { LanguageService } from '../../services/languageService';
import { Subscription } from 'rxjs';
interface WorkingData {
  title: string;
  place: string;
  tasks: string[];
}
@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent implements OnInit, OnDestroy {
  public experiences: WorkingData[] = [];
  private langageSubscription: Subscription;
  constructor(private principalService: LanguageService, private zone: NgZone) { }

  ngOnInit() {
    this.langageSubscription = this.principalService.getEnglishLangageState().subscribe((state) => {
      this.zone.run(() => {
        this.translateExperience(state);
      });
    });
  }

  ngOnDestroy() {
    this.langageSubscription.unsubscribe();
  }

  translateExperience(isEnglish: boolean) {
    this.experiences = [];
    if (isEnglish) {
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: `Part-time internship in software development (January 2019 - April 2019)`, place: 'Hydro-Quebec TransEnergie', tasks: [`Development with VB.Net of forms used by technicians for their calculations as part of the test procedures on a smart relay.`, 'Bug fixes in existing forms.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Full time internship in software development (May 2018 - August 2018)', place: 'Hydro-Quebec TransEnergie', tasks: ['Development with VB.Net of forms used by technicians for their calculations as part of the test procedures on a smart relay.', 'Integration of the project into existing software.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Full time internship in software development (May 2017 - August 2017)', place: 'Hydro-Quebec TransEnergie', tasks: ['Development with the C# of an application making it possible to direct the technician in the process of maintenance of a smart relay.', 'Unit test design.'] });
    } else {
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps partiel en développement logiciel (Janvier 2019 - Avril 2019)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage VB.Net de formulaires utilisés par les techniciens pour leurs calculs dans le cadre des procédures de tests d’un relais intelligent.', 'Correction de bugs dans des formulaires existants.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps plein en développement logiciel (Mai 2018 - Aout 2018)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage VB.Net de formulaires utilises par les techniciens pour leurs calculs dans le cadre des procédures de tests d’un relais intelligent.', 'Intégration du projet dans un logiciel déjà existant.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps plein en développement logiciel (Mai 2017 - Aout 2017)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage C# d’une application permettant d’orienter le technicien dans le processus de maintenance d’un relais intelligent.', 'Conception de tests unitaires.'] });
    }
  }

}
