import { NgZone } from '@angular/core';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { LanguageService } from 'src/app/services/languageService';
import { ChessRenderingService } from './classes/rendering/chessrendering.service';
import { ChoiceContainer } from './classes/choicecontainer';

@Component({
    selector: 'app-chess',
    templateUrl: './chess.component.html',
    styleUrls: ['./chess.component.scss']
})
export class ChessComponent implements OnInit, OnDestroy, AfterViewInit {
    private langageSubscription: Subscription;
    public displayWarning = false;
    public menuOpened = false;
    public showMenuButton = true;
    public warningMsg: string;
    public aiTypeLabel: string;
    // ['Depth First Search', 'Reinforcement Learning', 'Baysian networks'], ['Recherche en largeur', 'Apprentissage par reenforcement', 'Reseaux Bayesien']
    public aiChoices = new ChoiceContainer(['A star'], ['A étoile']);
    public difficultyLabel: string;
    public difficultyChoices = new ChoiceContainer(['Easy', 'Medium', 'Hard'], ['Facile', 'Normal', 'Difficile']);
    public viewLabel: string;
    public viewChoices = new ChoiceContainer(['From Front', 'From Top'], ['De face', 'De Haut']);
    public soundLabel: string;
    public soundChoices = new ChoiceContainer(['Off', 'On'], ['Sans', 'Avec']);
    public playLabel: string;
    constructor(private chessRenderingService: ChessRenderingService, private languageService: LanguageService , private zone: NgZone){
    }
    ngOnInit(): void {
        this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
            this.zone.run(() => {
              this.updateLangage(value);
            });
        });
        if ( window.navigator.userAgent.toLowerCase().includes('mobi'))
        {
            this.displayWarning = true;
        }
        else
        {
            this.chessRenderingService.init().then(() => {
                // this.chessRenderingService.setCameraControl(false);
                const container = document.querySelector('#render-container');
                container.removeChild(document.getElementById('progress-bar'));
                this.chessRenderingService.setupHtmlContainer(container);
                this.chessRenderingService.animate();
            });
        }
    }

    ngOnDestroy(): void {
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
            this.warningMsg = 'This application is not available on mobile, please use a computer.';
            this.aiTypeLabel = 'AI Type';
            this.difficultyLabel = 'Difficulty';
            this.viewLabel = 'View';
            this.soundLabel = 'Sound';
            this.playLabel = 'Play';
        }
        else
        {
            this.warningMsg = `Cette application est indisponible sur mobile, veuillez utiliser un ordinateur.`;
            this.aiTypeLabel = `Type d' IA`;
            this.difficultyLabel = 'Difficulté';
            this.viewLabel = 'Vue';
            this.soundLabel = 'Son';
            this.playLabel = 'Jouer';
        }
        this.aiChoices.setLangage(isEnglish);
        this.difficultyChoices.setLangage(isEnglish);
        this.viewChoices.setLangage(isEnglish);
        this.soundChoices.setLangage(isEnglish);
    }
    private updateSound(stopSound)
    {
        if (stopSound)
        {
            this.chessRenderingService.stopSound();
        }
        else
        {
            this.chessRenderingService.playSound();
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
    public startGame()
    {
        this.menuOpened = false;
        this.chessRenderingService.moveCameraToIdealPosition(this.viewChoices.getChoiceIndex() === 1).then(() => {

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
