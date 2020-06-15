import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import {LanguageService} from '../../services/languageService';
import { Router } from '@angular/router';
interface KeyValuePair {
  key: string;
  value: string;
}
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, AfterViewInit, OnDestroy {
  private shakingSystem: any;
  public projects: KeyValuePair[] = [];
  public projectShaker: boolean[] =  [false, false, false];
  private projectsUrl = ['portfolio/firstProject', 'portfolio/sudoku', 'portfolio/curling'];
  public projectsImgs: KeyValuePair[] = [];
  constructor(private principalService: LanguageService, private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.projects.push({ key: 'Projet I', value: `Projet initial de système embarqué à l'université`});
    this.projects.push({ key: 'Sudoku', value: `Sudoku` });
    this.projects.push({ key: 'Curling', value: `Curling` });
    this.projectsImgs.push({key: 'Projet I', value: '../../../assets/circuit.png'});
    this.projectsImgs.push({key: 'Sudoku', value: '../../../assets/sudoku.png'});
    this.projectsImgs.push({key: 'Curling', value: '../../../assets/curling.png'});
    this.principalService.getEnglishLangageState().subscribe((isEnglish: boolean) => {
      this.zone.run(() => this.translateProjects(isEnglish));
    });
  }

  ngOnDestroy(){
      clearInterval(this.shakingSystem);
  }

  ngAfterViewInit() {
    this.shakingSystem  = setInterval(() => {
        this.shakeAProject();
    }, 7000);
  }

  getImageSrc(index: number): string{
    return this.projectsImgs[index].value;
  }

  shakeAProject(){
      if (this.projectShaker.length > 0){
        const idx = Math.floor(Math.random() * (this.projectShaker.length - 1));
        this.projectShaker[idx] = true;
        setTimeout(() => {
            this.projectShaker[idx] = false;
        }, 3500);
    }
  }

  translateProjects(isEnglish: boolean) {
    this.projects = [];
    if (isEnglish) {
      this.projects.push({ key: 'Project I', value: `1st Project` });
      this.projects.push({ key: 'Sudoku', value: `Sudoku` });
      // this.projects.push({ key: 'Curling', value: `Curling` });
    } else {
      this.projects.push({ key: 'Projet I', value: `Projet 1`});
      this.projects.push({ key: 'Sudoku', value: `Sudoku` });
      // this.projects.push({ key: 'Curling', value: `Curling` });
    }
  }

  navigateToSelectedProject(index: number) {
    this.router.navigateByUrl(this.projectsUrl[index]);
  }
}
