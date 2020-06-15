import { Component, OnInit, NgZone, OnDestroy , AfterViewInit} from '@angular/core';
import { LanguageService } from '../../../services/languageService';
import { Subscription } from 'rxjs';
import { SudokuService } from './sudoke.service';
export interface GridPair {
  grid: number[];
  solution: number[];
}
interface GridCase {
  value: string;
  isInput: boolean;
  isWrong: boolean;
}
@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss']
})
export class SudokuComponent implements OnInit, OnDestroy, AfterViewInit {
  public gridLoaded = false;
  public sudokuGrid: GridCase[][] = [];
  private sudokuSolution: string[][] = [];
  public submitBoutonText = 'Soumettre';
  public hardBoutonText = 'Difficile';
  public mediumBoutonText = 'Moyen';
  public easyBoutonText = 'Facile';
  private langageSubscription: Subscription;
  public nbSeconds = 0;
  public timeText = 'Temps écoulé: ';
  public secondsText = ' secondes';
  public choiceMade = false;
  public successMsg = 'Felicitation, la grille est valide !';
  public warningMsg = `Attention ! Il est conseille d' utiliser un ordinateur pour executer ce jeu`;
  private timeIndicator = 'Temps : ';
  public displayWarning = false;
  // tslint:disable-next-line:max-line-length
  constructor(private languageService: LanguageService, private sudokuService: SudokuService , private zone: NgZone) { }

  ngOnInit() {
    this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
      this.zone.run(() => {
        this.changeLangage(value);
      });
    });
    if ( window.navigator.userAgent.toLowerCase().includes('mobi') ){
      this.displayWarning = true;
    }
  }
  ngOnDestroy(): void {
    this.langageSubscription.unsubscribe();
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'black';
    childrenContainer.style.opacity = '0.8';
  }
  loadANewGrid(difficulty: number) {
    this.gridLoaded = false;
    setTimeout(() => {
      this.sudokuService.GetSudokuGrid(difficulty).then((value: GridPair) => {
        for (let i = 0; i < 9 ; ++i) {
          this.sudokuGrid.push([]);
          this.sudokuSolution.push([]);
          for (let j = 0; j < 9 ; ++j) {
            if (value.grid[9 * i + j] === -1) {
              this.sudokuGrid[i].push({value: '', isInput: true, isWrong: false});
            } else {
              this.sudokuGrid[i].push({value: value.grid[9 * i + j].toString(), isInput: false, isWrong: false});
            }
            this.sudokuSolution[i].push(value.solution[9 * i + j].toString());
          }
        }
        this.gridLoaded = true;
        this.startChrono();
      });
    }, 100);
  }
  // src: https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
 public convertTime(secs): string{
    const secNum = parseInt(secs, 10);
    const hours   = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = secNum % 60;

    return [hours, minutes, seconds]
        .map(v => v < 10 ? '0' + v : v)
        .filter((v, i) => v !== '00' || i > 0)
        .join(':');
  }
  startChrono() {
    setInterval(() => {
      this.nbSeconds++;
    }, 1000);
  }
  makeChoice(level: number) {
    this.choiceMade = true;
    this.loadANewGrid(level);
  }
  insertInGrid(event: any, i: string | number, j: string | number) {
    this.sudokuGrid[i][j].value  =  event.target.value;
  }
  trackByFn(index: any, item: any) {
    return index;
 }
  verifyGrid() {
    let success = true;
    const time = this.nbSeconds;
    for ( let i = 0; i < this.sudokuGrid.length; ++i) {
      for (let j = 0; j < this.sudokuGrid[i].length ; ++j) {
          if (this.sudokuGrid[i][j].value !== this.sudokuSolution[i][j]) {
            this.sudokuGrid[i][j].isWrong = true;
            success = false;
          } else {
            this.sudokuGrid[i][j].isWrong = false;
          }
      }
    }
    if (success) {
      setTimeout(() => {
        alert(this.successMsg + ' ' + this.timeIndicator + time);
        this.gridLoaded = false;
        this.choiceMade = false;
      }, 100);
    }
  }
  changeLangage(isEnglish: boolean) {
    if (isEnglish) {
      this.submitBoutonText = 'Check';
      this.timeText = 'Elapsed time: ';
      this.secondsText = ' seconds';
      this.hardBoutonText = 'Hard';
      this.mediumBoutonText = 'Medium';
      this.easyBoutonText = 'Easy';
      this.successMsg = 'Congratulations, the grid is valid!';
      this.warningMsg = 'Warning ! this game require a pc.';
      this.timeIndicator = 'Time : ';
    } else {
      this.submitBoutonText = 'Verifier';
      this.timeText = 'Temps écoulé: ';
      this.secondsText = ' secondes';
      this.hardBoutonText = 'Difficile';
      this.mediumBoutonText = 'Moyen';
      this.easyBoutonText = 'Facile';
      this.successMsg = 'Felicitation, la grille est valide !';
      this.warningMsg = `Attention ! Il est conseillé d' utiliser un ordinateur pour executer ce jeu.`;
      this.timeIndicator = 'Temps : ';
    }
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'white';
    childrenContainer.style.opacity = '1';
  }
}
