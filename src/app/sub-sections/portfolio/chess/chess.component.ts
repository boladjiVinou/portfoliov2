import { NgZone } from '@angular/core';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { LanguageService } from 'src/app/services/languageService';
import { ChessRenderingService } from './classes/rendering/chessrendering.service';
import { ChoiceContainer } from './classes/choicecontainer';
import { ChessPiece } from './classes/pieces/chesspiece';
import { PieceType } from './classes/pieces/PieceType';
import { ChessGame } from './classes/game/chessgame';
import { AIType } from './classes/player/aichessplayer';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IViewRequest
{
    askTypeToPromoteTo(): Promise<PieceType>;
}

@Component({
    selector: 'app-chess',
    templateUrl: './chess.component.html',
    styleUrls: ['./chess.component.scss'],
    providers: [ChessRenderingService]
})
export class ChessComponent implements OnInit, OnDestroy, AfterViewInit, IViewRequest {
    private langageSubscription: Subscription;
    public displayWarning = false;
    public menuOpened = false;
    public showMenuButton = false;
    public showPawnPromotionDialog = false;
    public pawnPromotionQuestion: string;
    public pawnPromotionChoice: PieceType;
    public warningMsg: string;
    public aiTypeLabel: string;
    public queen: string;
    public bishop: string;
    public rook: string;
    public knight: string;
    // public aiChoices = new ChoiceContainer(['AlphaBeta'], ['AlphaBeta']);
    public difficultyLabel: string;
    public difficultyChoices = new ChoiceContainer(['Easy', 'Medium', 'Hard'], ['Facile', 'Normal', 'Difficile']);
    public viewLabel: string;
    public viewChoices = new ChoiceContainer(['From Front', 'From Top'], ['De face', 'De Haut']);
    public soundLabel: string;
    public soundChoices = new ChoiceContainer(['Off', 'On'], ['Sans', 'Avec']);
    public soundEffectLabel: string;
    public soundEffectChoices = new ChoiceContainer(['Off', 'On'], ['Sans', 'Avec']);
    public playerTypeLabel: string;
    public playerTypesChoices = new ChoiceContainer(['Human', 'CPU'], ['Humain', 'CPU']);
    public playerColorLabel: string;
    public playerColorChoices = new ChoiceContainer(['White', 'Black'], ['Blanc', 'Noir']);
    public showCredits = false;
    public playLabel: string;
    private chessGame: ChessGame;
    private pieceTypeSubject: BehaviorSubject<PieceType> = new BehaviorSubject(PieceType.PAWN);
    private pieceTypeObservable: Observable<PieceType>;
    public isMobile = false;
    public heavyProcessing = false;
    constructor(private chessRenderingService: ChessRenderingService, private languageService: LanguageService , private zone: NgZone){
    }
    askTypeToPromoteTo(): Promise<PieceType> {
        return new Promise<PieceType> (resolve =>
            {
                this.showPawnPromotionDialog = true;
                let choiceSubscription: Subscription = null;
                choiceSubscription = this.pieceTypeObservable.subscribe(chosenType =>
                    {
                        if (choiceSubscription !== null)
                        {
                            choiceSubscription.unsubscribe();
                            this.showPawnPromotionDialog = false;
                            this.pieceTypeSubject.next(PieceType.PAWN);
                            resolve(chosenType);
                            return;
                        }
                    });
            });
    }
    submitPromotionChoice()
    {
        console.log('submiting choice');
        this.pieceTypeSubject.next(this.pawnPromotionChoice);
    }
    private checkIsMobile()
    {
        this.isMobile = /*window.navigator.userAgent.toLowerCase().includes('mobi') &&*/ window.innerWidth < 600;
    }
    private setHeavyProcessing(isProcessing: boolean): void
    {
        this.heavyProcessing = isProcessing;
    }
    ngOnInit(): void {
        this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
            this.zone.run(() => {
              this.updateLangage(value);
            });
        });
        this.checkIsMobile();
        this.chessRenderingService.init().then(() => {
            this.chessGame = new ChessGame();
            this.chessGame.preInit(this.chessRenderingService, this.setHeavyProcessing.bind(this)).then(() =>
            {
                const container = document.querySelector('#render-container');
                container.removeChild(document.getElementById('progress-bar'));
                this.chessRenderingService.setupHtmlContainer(container, this.checkIsMobile.bind(this));
                this.chessRenderingService.animate();
                this.showMenuButton = true;
            });
        });
        this.pieceTypeObservable = this.pieceTypeSubject.asObservable();
    }

    ngOnDestroy(): void {
        this.chessRenderingService.stopAmbientSound();
        this.langageSubscription.unsubscribe();
        const childrenContainer = document.querySelector('.children-container') as HTMLElement;
        childrenContainer.style.opacity = '0.8';
        const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
        videoElement.play();
    }

    ngAfterViewInit(): void {
        const childrenContainer = document.querySelector('.children-container') as HTMLElement;
        childrenContainer.style.backgroundColor = 'black';
        childrenContainer.style.opacity = '1';
        const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
        videoElement.pause();
    }

    updateLangage(isEnglish: boolean)
    {
        if (isEnglish)
        {
            this.warningMsg = 'This application is not recommended on mobile, please use a computer.';
            this.aiTypeLabel = 'AI Type';
            this.difficultyLabel = 'Difficulty';
            this.viewLabel = 'View';
            this.soundLabel = 'Music';
            this.soundEffectLabel = 'Sound Effect';
            this.playLabel = 'Play';
            this.pawnPromotionQuestion = 'Your pawn need to be promoted, choose a type';
            this.queen = 'Queen';
            this.bishop = 'Bishop';
            this.rook = 'Rook';
            this.knight = 'Knight';
            this.playerColorLabel = 'Color Choice';
            this.playerTypeLabel = 'Player Type';
        }
        else
        {
            this.warningMsg = `Cette application n'est pas optimale sur mobile, veuillez utiliser un ordinateur.`;
            this.aiTypeLabel = `Type d' IA`;
            this.difficultyLabel = 'Difficulté';
            this.viewLabel = 'Vue';
            this.soundLabel = 'Musique';
            this.soundEffectLabel = 'Bruitage';
            this.playLabel = 'Jouer';
            this.pawnPromotionQuestion = 'Votre pion doit etre promu, veuillez selectionner un nouveau type';
            this.queen = 'Reine';
            this.bishop = 'Fou';
            this.rook = 'Tour';
            this.knight = 'Cavalier';
            this.playerColorLabel = 'Choix de couleur';
            this.playerTypeLabel = 'Type de joueur';
        }
        // this.aiChoices.setLangage(isEnglish);
        this.difficultyChoices.setLangage(isEnglish);
        this.viewChoices.setLangage(isEnglish);
        this.soundChoices.setLangage(isEnglish);
        this.soundEffectChoices.setLangage(isEnglish);
        this.playerColorChoices.setLangage(isEnglish);
        this.playerTypesChoices.setLangage(isEnglish);
    }
    private updateSound(stopSound)
    {
        if (stopSound)
        {
            this.chessRenderingService.stopAmbientSound();
        }
        else
        {
            this.chessRenderingService.playAmbientSound(true);
        }
    }
    public onSoundPrevChoice()
    {
        this.soundChoices.previousChoice();
        this.updateSound(this.soundChoices.getChoiceIndex() === 0);
    }
    public onSoundNextChoice()
    {
        this.soundChoices.nextChoice();
        this.updateSound(this.soundChoices.getChoiceIndex() === 0);
    }
    public onSoundEffectPrevChoice()
    {
        this.soundEffectChoices.previousChoice();
        ChessPiece.AUDIO_MVT_PLAYER.setEnable(this.soundEffectChoices.getChoiceIndex() === 1);
    }
    public onSoundEffectNextChoice()
    {
        this.soundEffectChoices.nextChoice();
        ChessPiece.AUDIO_MVT_PLAYER.setEnable(this.soundEffectChoices.getChoiceIndex() === 1);
    }
    public onPlayerTypeNextChoice()
    {
        this.playerTypesChoices.nextChoice();
    }
    public onPlayerTypePrevChoice()
    {
        this.playerTypesChoices.previousChoice();
    }
    public onPlayerColorNextChoice()
    {
        this.playerColorChoices.nextChoice();
    }
    public onPlayerColorPrevChoice()
    {
        this.playerColorChoices.previousChoice();
    }
    public startGame()
    {
        this.menuOpened = false;
        this.chessGame.init(this.chessRenderingService, this, AIType.MININMAX, //
                this.playerTypesChoices.getChoiceIndex() === 1, this.playerColorChoices.getChoiceIndex()).then(() =>
        {
            this.chessRenderingService.moveCameraToIdealPosition(this.viewChoices.getChoiceIndex() === 1, this.playerColorChoices.getChoiceIndex() ).then(() => {
                this.chessGame.start();
            });
        });
    }
    public onMenuClick()
    {
        this.menuOpened = !this.menuOpened;
        if (this.menuOpened )
        {
            this.showMenuButton = false;
        }
    }

}
