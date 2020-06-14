import { Component, OnInit, NgZone, OnDestroy, AfterViewInit } from '@angular/core';
import { LanguageService } from '../../../services/languageService';
import { Subscription } from 'rxjs';
import { ProjectOneRendererService } from './project-one-renderer.service';

@Component({
  selector: 'app-project-one',
  templateUrl: './project-one.component.html',
  styleUrls: ['./project-one.component.scss'],
  providers: [ProjectOneRendererService]
})
export class ProjectOneComponent implements OnInit, OnDestroy,AfterViewInit {

  public projectTitle = 'Projet I';
  // tslint:disable-next-line:max-line-length
  public projectDescription: string[] = [`In this first year's project, I had to design a robot equipped with an AT-Mega 32 microcontroller to analyze the walls of a mine, to make a graphical rendering of the curves of each wall, then calculate the percentage of area occupied from the distances read during the run. (It is assumed that there is no void behind the walls.). The simulation on the right illustrates this project.`];
  public boutonText = 'Recommencer la simulation';
  private langageSubscription: Subscription;
  public renderLoadingProgress = 0;
  constructor(private principalService: LanguageService, private zone: NgZone, private renderService: ProjectOneRendererService) { }

  ngOnInit() {
    this.langageSubscription = this.principalService.getEnglishLangageState().subscribe((value) => {
      this.zone.run(() => {
        this.changeLangage(value);
      });
    });
    this.renderService.init().then(() => {
      const container = document.querySelector('#render-container');
      container.removeChild(document.getElementById('progress-bar'));
      this.renderService.renderer.domElement.id = 'renderBody';
      this.renderService.renderer.domElement.style.width = '100%';
      this.renderService.renderer.domElement.style.height = '90%';
      container.appendChild(this.renderService.renderer.domElement);
      this.renderService.renderer.setSize(container.clientWidth, container.clientHeight);
      window.addEventListener('resize', this.rendererResizer.bind(this));
      this.renderService.animate();
    });
  }
  private rendererResizer(event) {
    const parent = document.querySelector('#render-container');
    if (parent) {
      this.renderService.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.opacity = '1';
  }
  ngOnDestroy() {
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.opacity = '0.8';
    this.langageSubscription.unsubscribe();
    window.removeEventListener('resize', this.rendererResizer.bind(this));
  }
  resetRender() {
    this.renderService.resetRender();
  }
  changeLangage(isEnglish: boolean) {
    this.projectDescription = [];
    if (isEnglish) {
      this.projectTitle = 'Project I';
      this.boutonText = 'Restart the simulation';
      // tslint:disable-next-line:max-line-length
      this.projectDescription.push(`In this first year's project, I had to design a robot equipped with an AT-Mega 32 microcontroller to analyze the walls of a mine, to make a graphical rendering of the curves of each wall, then calculate the percentage of area occupied from the distances read during the run. (It is assumed that there is no void behind the walls.). The simulation on the right illustrates this project.`);
    } else {
      this.projectTitle = 'Projet I';
      this.boutonText = 'Recommencer la simulation';
      // tslint:disable-next-line:max-line-length
      this.projectDescription.push(`Dans le cadre de ce projet en 1ere année, je devais concevoir en équipe un robot doté d’un microcontrôleur AT-Méga 32 permettant d’analyser les parois d’une mine, d’effectuer un rendu graphique des courbes de chaque paroi, puis de calculer le pourcentage de surface occupée à partir des distances lues pendant le parcours. (On suppose qu’il n’y a pas de vide derrière les parois.). La simulation à droite illustre ce projet.`);
    }
  }
}
