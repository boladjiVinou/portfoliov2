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

  public startMenu = true;
  public onePlayer = false;
  public playerChoiceMade = false;
  public difficultyChoiceMade = false;
  public infosChoiceMade = false;
  public level = 1;
  private langageSubscription: Subscription;
  public startLabel = 'COMMENCER';
  public infosLabel = 'INFORMATIONS';
  public infosLabelBackLabel = 'RETOUR';
  public infosDDescriptionLabel = 'Cliquez gauche pour tirer, appuyez sur la touche S pour mettre la pierre en rotation, cliquer gauche à répétition pour faire un balayage.';
  public soundLabel = 'SON';
  public player1Label = '1 JOUEUR';
  public player2Label = '2 JOUEURS';
  public easyLabel = 'FACILE';
  public mediumLabel = 'MEDIUM';
  public hardLabel = 'DIFFICILE';
  public score  = '';
  public currentPlayer = '';
  public player1NbOfStones = 1;
  public player2NbOfStones = 1;
  public round = '';
  public hideHud = true;
  public gameStarted = false;
  public hideLogo = false;
  public game: CurlingGame;
  public readonly nbOfStones = 8;
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
      this.infosLabel = 'INFORMATIONS';
      this.infosLabelBackLabel = 'BACK';
      this.infosDDescriptionLabel = 'Left click to shoot, press S to rotate stone, left click repeatedly to sweep.';
    } else {
      this.startLabel = 'COMMENCER';
      this.soundLabel = 'SON :';
      this.player1Label = '1 JOUEUR';
      this.player2Label = '2 JOUEURS';
      this.easyLabel = 'FACILE';
      this.mediumLabel = 'MEDIUM';
      this.hardLabel = 'DIFFICILE';
      this.infosLabel = 'INFORMATIONS';
      this.infosLabelBackLabel = 'RETOUR';
      this.infosDDescriptionLabel = 'Cliquez gauche pour tirer, appuyez sur la touche S pour mettre la pierre en rotation, cliquer gauche à répétition pour faire un balayage.';
    }
  }
  difficultyChoice(level: number) {
    this.level = level;
    this.difficultyChoiceMade = true;
    this.game.initPlayers(true, 8, this.level).then(() => {
      this.game.startGame();
      this.hideLogo = true;
      this.hideHud = true;
      this.gameStarted = true;
    });

  }
  startButtonClick() {
    this.startMenu = false;
    this.onePlayer = false;
    this.playerChoiceMade = false;
  }
  playerChoice(choice: number) {
    this.onePlayer = false;
    this.playerChoiceMade = true;
    if (choice === 1) {
      this.onePlayer = true;
    }
    else{
      this.game.initPlayers(false, this.nbOfStones).then(() => {
        this.game.startGame();
        this.hideLogo = true;
        this.hideHud = true;
        this.playerChoiceMade = true;
        this.gameStarted = true;
      });
    }
  }
  ngOnDestroy() {
    const progressBar = document.getElementById('shooting-progress-div');
    if (progressBar) {
      progressBar.style.display = 'none';
    }
    this.game.clearGameTick();
    this.curlingService.stop();
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.opacity = '0.8';
    window.removeEventListener('resize', this.rendererResizer.bind(this));
    this.langageSubscription.unsubscribe();
    const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
    videoElement.play();
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'black';
    childrenContainer.style.opacity = '1';
    const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
    videoElement.pause();
  }
  private rendererResizer(event) {
    const parent = document.querySelector('#render-container');
    if (parent) {
      this.curlingService.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
  }

  public getStep(){
    return this.game.getRound().toString() + ' : ' + this.game.getSubTurn().toString();
  }

  public chooseInfos(){
    this.infosChoiceMade = true;
    this.startMenu = false;
  }
  public cancelInfosDisplay()
  {
    this.infosChoiceMade = false;
    this.startMenu = true;
  }
}
