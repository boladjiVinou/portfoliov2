import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import { CurlingService } from './curling.service';
import { LanguageService } from '../../../services/languageService';
import { Subscription } from 'rxjs';
import { CurlingGame } from './Classes/curling-game';
@Component({
  selector: 'app-curling',
  templateUrl: './curling.component.html',
  styleUrls: ['./curling.component.scss'],
  providers: [CurlingService]
})
export class CurlingComponent implements OnInit, OnDestroy, AfterViewInit {

  private startMenu = true;
  private onePlayer = false;
  private playerChoiceMade = false;
  private difficultyChoiceMade = false;
  private level = 1;
  private langageSubscription: Subscription;
  private startLabel = 'COMMENCER';
  private soundLabel = 'SON';
  private player1Label = '1 JOUEUR';
  private player2Label = '2 JOUEURS';
  private easyLabel = 'FACILE';
  private mediumLabel = 'MEDIUM';
  private hardLabel = 'DIFFICILE';
  private score  = '';
  private currentPlayer = '';
  private player1NbOfStones = 1;
  private player2NbOfStones = 1;
  private round = '';
  private hideHud = true;
  private hideLogo = false;
  public game: CurlingGame;
  private readonly nbOfStones = 8;
  constructor(private curlingService: CurlingService, private principalService: LanguageService, private zone: NgZone) {

  }

  ngOnInit() {
    this.curlingService.init().then(() => {
      this.hideHud = false;
      const container = document.querySelector('#render-container');
      container.removeChild(document.getElementById('progress-bar'));
      this.curlingService.renderer.domElement.id = 'renderBody';
      this.curlingService.renderer.domElement.style.width = '100%';
      this.curlingService.renderer.domElement.style.height = '100%';
      container.appendChild(this.curlingService.renderer.domElement);
      this.curlingService.renderer.setSize(container.clientWidth, container.clientHeight);
      window.addEventListener('resize', this.rendererResizer.bind(this));
      this.curlingService.initAudio();
      this.curlingService.animate();
    });
    this.langageSubscription = this.principalService.getEnglishLangageState().subscribe((value) => {
      this.zone.run(() => {
        this.changeLangage(value);
      });
    });
    this.game = new CurlingGame(this.curlingService);
  }
  playSound() {
    this.curlingService.playSound();
  }
  stopSound() {
    this.curlingService.stopSound();
  }
  changeLangage(isEnglish) {
    if (isEnglish) {
      this.startLabel = 'START';
      this.soundLabel = 'SOUND :';
      this.player1Label = '1 PLAYER';
      this.player2Label = '2 PLAYERS';
      this.easyLabel = 'EASY';
      this.mediumLabel = 'MEDIUM';
      this.hardLabel = 'HARD';
    } else {
      this.startLabel = 'COMMENCER';
      this.soundLabel = 'SON :';
      this.player1Label = '1 JOUEUR';
      this.player2Label = '2 JOUEURS';
      this.easyLabel = 'FACILE';
      this.mediumLabel = 'MEDIUM';
      this.hardLabel = 'DIFFICILE';
    }
  }
  difficultyChoice(level: number) {
    this.level = level;
    this.difficultyChoiceMade = true;
    this.game.initPlayers(true, 4, this.level).then(() => {
      this.game.startGame();
      this.hideLogo = true;
      this.hideHud = true;
    });

  }
  startButtonClick() {
    this.startMenu = false;
    this.onePlayer = false;
    this.playerChoiceMade = false;
  }
  playerChoice(choice: number) {
    this.onePlayer = false;
    if (choice === 1) {
      this.onePlayer = true;
    }
    this.game.initPlayers(false, this.nbOfStones).then(() => {
      this.game.startGame();
      this.hideLogo = true;
      this.hideHud = true;
      this.playerChoiceMade = true;
    });
  }
  ngOnDestroy() {
    const progressBar = document.getElementById('shooting-progress-div');
    progressBar.style.display = 'none';
    this.game.clearGameTick();
    this.curlingService.stop();
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'black';
    childrenContainer.style.opacity = '1';
  }
  private rendererResizer(event) {
    const parent = document.querySelector('#render-container');
    if (parent) {
      this.curlingService.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
  }

}
