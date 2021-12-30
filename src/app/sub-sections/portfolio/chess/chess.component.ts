import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChessService } from './chess.service';

@Component({
    selector: 'app-chess',
    templateUrl: './chess.component.html',
    styleUrls: ['./chess.component.scss']
})
export class ChessComponent implements OnInit, OnDestroy, AfterViewInit {

    constructor(private chessService: ChessService){
    }
    ngOnInit(): void {
        this.chessService.init().then(() => {
            const container = document.querySelector('#render-container');
            container.removeChild(document.getElementById('progress-bar'));
            this.chessService.setupHtmlContainer(container);
            this.chessService.animate();
        });
    }

    ngOnDestroy(): void {
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

}
