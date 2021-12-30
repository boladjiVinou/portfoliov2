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
      this.experiences.push({ title: 'Full-time Employment in Software Development', place: 'Dental-Wings', tasks: ['Implementation / improvement of functionalities in the front-end application of an intra-oral scanner', 'Implementation of 2D and 3D algorithms']});
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Full-time Employment in ETL Development (July 2019 - December 2020)', place: 'MEDFAR Clinical Solutions', tasks: [`Integration of Medical data by developping C# and SQL scripts`, `Improvement of custom data transfer softwares.`]});
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: `Part-time internship in Software development (January 2019 - April 2019)`, place: 'Hydro-Quebec TransEnergie', tasks: [`Development with VB.Net of forms used by technicians for their calculations as part of the test procedures on a smart relay.`, 'Bug fixes in existing forms.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Full time internship in Software development (May 2018 - August 2018)', place: 'Hydro-Quebec TransEnergie', tasks: ['Development with VB.Net of forms used by technicians for their calculations as part of the test procedures on a smart relay.', 'Integration of the project into existing software.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Full time internship in Software development (May 2017 - August 2017)', place: 'Hydro-Quebec TransEnergie', tasks: ['Development with the C# of an application making it possible to direct the technician in the process of maintenance of a smart relay.', 'Unit test design.'] });
    } else {
      this.experiences.push({title: 'Développeur Logiciel (Janvier 2021 - Aujourdhui)', place: 'Dental-Wings', tasks: [`Implémentation/amelioration de fonctionnalités dans l' application front-end d' un scanner intra-oral`, `Implémentation d' algorithmes 2D et 3D`]});
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Developpeur ETL Junior (Juillet 2019 - Décembre 2020)', place: 'MEDFAR Solutions Cliniques', tasks: [`Developpement avec les languages C# et SQL de scripts pour l' integration de donnnees medicales`, `Amelioration des logiciels custom de transferts de donnees`]});
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps partiel en Développement logiciel (Janvier 2019 - Avril 2019)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage VB.Net de formulaires utilisés par les techniciens pour leurs calculs dans le cadre des procédures de tests d’un relais intelligent.', 'Correction de bugs dans des formulaires existants.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps plein en Développement logiciel (Mai 2018 - Aout 2018)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage VB.Net de formulaires utilises par les techniciens pour leurs calculs dans le cadre des procédures de tests d’un relais intelligent.', 'Intégration du projet dans un logiciel déjà existant.'] });
      // tslint:disable-next-line:max-line-length
      this.experiences.push({ title: 'Stage à temps plein en Développement logiciel (Mai 2017 - Aout 2017)', place: 'Hydro-Quebec TransEnergie', tasks: ['Développement avec le langage C# d’une application permettant d’orienter le technicien dans le processus de maintenance d’un relais intelligent.', 'Conception de tests unitaires.'] });
    }
  }

}
