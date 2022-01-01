import { NgZone } from '@angular/core';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { LanguageService } from 'src/app/services/languageService';
import { ChessService } from './chess.service';

@Component({
    selector: 'app-chess',
    templateUrl: './chess.component.html',
    styleUrls: ['./chess.component.scss']
})
export class ChessComponent implements OnInit, OnDestroy, AfterViewInit {
    private langageSubscription: Subscription;
    public displayWarning = false;
    public menuOpened = false;
    public warningMsg: string;
    constructor(private chessService: ChessService, private languageService: LanguageService , private zone: NgZone){
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
            this.chessService.init().then(() => {
                const container = document.querySelector('#render-container');
                container.removeChild(document.getElementById('progress-bar'));
                this.chessService.setupHtmlContainer(container);
                this.chessService.animate();
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
        }
        else
        {
            this.warningMsg = `Cette application est indisponible sur mobile, veuillez utiliser un ordinateur.`;
        }
    }
    public onMenuClick()
    {
        this.menuOpened = !this.menuOpened;
    }

}
