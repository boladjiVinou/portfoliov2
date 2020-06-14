import { Component, OnInit, NgZone, OnDestroy , AfterViewInit} from '@angular/core';
import { LanguageService } from '../../../services/languageService';
import { Subscription } from 'rxjs';
import {SudokuGenerator} from './classes/SudokuGenerator';
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
  private sudokuGrid: GridCase[][] = [];
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
  private successMsg = 'Felicitation, la grille est valide !';
  private sudokuGenerator: SudokuGenerator;
  // tslint:disable-next-line:max-line-length
  constructor(private languageService: LanguageService, private zone: NgZone) { }

  ngOnInit() {
    this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
      this.zone.run(() => {
        this.changeLangage(value);
      });
    });
    this.sudokuGenerator = new SudokuGenerator();
  }
  ngOnDestroy(): void {
    this.langageSubscription.unsubscribe();
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'black';
  }
  loadANewGrid(difficulty: number) {
    this.gridLoaded = false;
    setTimeout(() => {
      this.sudokuGenerator.generateAGrid(difficulty).then((value: GridPair) => {
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
    }, 2000);
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
        alert(this.successMsg);
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
    } else {
      this.submitBoutonText = 'Verifier';
      this.timeText = 'Temps écoulé: ';
      this.secondsText = ' secondes';
      this.hardBoutonText = 'Difficile';
      this.mediumBoutonText = 'Moyen';
      this.easyBoutonText = 'Facile';
      this.successMsg = 'Felicitation, la grille est valide !';
    }
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'white';
  }
}
