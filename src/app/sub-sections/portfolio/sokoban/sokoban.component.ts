import { Component, OnInit, OnDestroy, NgZone , AfterViewInit } from '@angular/core';
import {LanguageService} from '../../../services/languageService';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-sokoban',
  templateUrl: 'sokoban.component.html',
  styleUrls: ['sokoban.component.scss']
})
export class SokobanComponent implements OnInit, OnDestroy, AfterViewInit {
  private langageSubscription: Subscription;
  public descriptionParagraphs: string[] = ['', '', '', ''];
  constructor(private languageService: LanguageService, private zone: NgZone){

  }
  ngOnInit(): void {
    this.langageSubscription = this.languageService.getEnglishLangageState().subscribe((value) => {
        this.zone.run(() => {
          this.changeLangage(value);
        });
    });
  }
  changeLangage(isEnglish: boolean) {
    if (isEnglish) {
      this.descriptionParagraphs[0] =  `Sokoban is a Japanese puzzle game.
      In this game, the player must arrange crates on target squares.
      He can move in all four directions and push only one crate at a time.
      The goal is to succeed with the minimum possible movements.`;
      this.descriptionParagraphs[1] =  `I was able to design a bot capable of solving sokoban puzzles
      ranging from scoria level 1-1 to scoria level 3-10 on the codingames.com website .`;
      this.descriptionParagraphs[2] =  `The main approach used was a breadth first search (BFS) of the different kinds of movements
      as well as a pruning of the states already encountered, or useless or counterproductive displacements.
      One challenge was to represent the states in the shortest way possible so that
      the search is not too expensive and respects time and memory constraints.`;
      this.descriptionParagraphs[3] =  `You can try to solve it also via this link: https://www.codingame.com/training/hard/sokoban`;
    }
    else {
      this.descriptionParagraphs[0] =  `Le Sokoban est un jeu de réflexion d'origine japonaise.
      Dans ce jeu, le joueur doit ranger des caisses sur des cases cible.
      Il peut se déplacer dans les quatre directions et pousser une seule caisse à la fois.
      L'idéal est de réussir avec le minimum de déplacements possibles.`;
      this.descriptionParagraphs[1] =  `J'ai pu concevoir un bot sur le site codingames.com capable de résoudre des puzzles de sokoban
            allant du niveau scoria 1-1 au niveau scoria 3-10.`;
      this.descriptionParagraphs[2] =  `L'approche utilisée a été une recherche en largeur (BFS) des différentes possibilités de déplacements
                  ainsi qu'un élagage des états déjà rencontrés, ou des déplacements inutiles ou contre productifs.
                  Un des challenges fut de représenter les états de la plus courte manière possible afin que
                  la recherche ne soit pas trop coûteuse et ne respecte les contraintes de temps et de memoire.`;
      this.descriptionParagraphs[3] =  `Vous pouvez essayer de le résoudre également via ce lien : https://www.codingame.com/training/hard/sokoban`;
    }
  }
  ngOnDestroy(): void {
    this.langageSubscription.unsubscribe();
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.backgroundColor = 'black';
    childrenContainer.style.opacity = '0.8';
    const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
    videoElement.play();
  }
  ngAfterViewInit(){
    const childrenContainer = document.querySelector('.children-container') as HTMLElement;
    childrenContainer.style.opacity = '1';
    const videoElement = document.getElementById('background-vid1') as HTMLVideoElement;
    videoElement.pause();
  }
}
