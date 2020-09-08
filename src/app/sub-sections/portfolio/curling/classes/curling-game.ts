import { CurlingPlayer, HumanCurlingPlayer, AICurlingPlayer } from './curling-player';
import { CurlingStone} from './curling-stone';
import { CurlingService } from './../curling.service';
import { PhysicWorld } from './physic-world';
import * as THREE from 'three';
import * as Constant from './Constant';

// x: 330 1ere ligne
// x : -265 2e ligne
// x: -450 centre cible
// 50 rayon du cercle
export class CurlingGame {
    private player1: CurlingPlayer;
    private player2: CurlingPlayer;
    private currentPlayer: CurlingPlayer = null;
    private curlingService: CurlingService;
    private tickIntervalCall: any;
    private timerIntervallCall: any;
    private followerInterval: any;
    private physicWorld: PhysicWorld;
    private deltaTime = 0;
    private subTurn = 0;
    private round = 0;
    private winLabel = 'Vainqueur: ';
    public constructor(service: CurlingService) {
        this.curlingService = service;
        this.physicWorld = new PhysicWorld();
        this.timerIntervallCall = setInterval(() => {
            this.deltaTime += 1;
        }, 1);
        this.curlingService.worldUpdater = this.gameTick.bind(this);
    }
    private debugPositions() {
        window.addEventListener('keydown', (event: KeyboardEvent ) => {
            if (this.currentPlayer !== null){
                const pos =  this.currentPlayer.getCurrentStone().getPostion();
                switch (event.key){
                    case 'w':
                        pos.x -= 1;
                        break;
                    case 's':
                        pos.x += 1;
                        break;
                    case 'a':
                        pos.z += 1;
                        break;
                    case 'd':
                        pos.z -= 1;
                        break;
                }
                this.currentPlayer.getCurrentStone().setPostion(pos);
                console.log(pos);
            }
        });
    }
    public GetPlayer1(): CurlingPlayer {
        return this.player1;
    }
    public GetPlayer2(): CurlingPlayer {
        return this.player2;
    }
    public getCurrentPlayerName(): string
    {
        if (this.currentPlayer)
        {
            return this.currentPlayer.getName();
        }
        return '';
    }
    public clearGameTick() {
        clearInterval(this.tickIntervalCall);
        if (this.player1) {
            this.player1.destroy();
        }
        if (this.player2) {
            this.player2.destroy();
        }
        if (this.followerInterval) {
            clearInterval(this.followerInterval);
        }
        clearInterval(this.timerIntervallCall);
    }
    private gameTick() {
        this.physicWorld.setDeltaTime(this.deltaTime  / 1000);
        this.physicWorld.updateWorld();
        this.deltaTime = 0;
    }
    public initPlayers(useAI: boolean, nbOfStonePerPlayer: number, level = 0): Promise<void> {
        return new Promise<void>((resolve) => {
            this.player1 = new HumanCurlingPlayer();
            this.player1.setName('Player1');
            if (useAI) {
                this.player2 = new AICurlingPlayer(level, this.physicWorld);
                this.player2.setName('AIPlayer');
            } else {
                this.player2 = new HumanCurlingPlayer();
                this.player2.setName('Player2');
            }
            let stonesLoaded = false;
            let broomsLoaded = false;
            this.nbOfStonePerPlayer(nbOfStonePerPlayer).then(() => {
                stonesLoaded = true;
                if (stonesLoaded && broomsLoaded) {
                    resolve();
                    return;
                }
            });
            this.initPlayersBroom().then(() => {
                broomsLoaded = true;
                if (stonesLoaded && broomsLoaded) {
                    resolve();
                    return;
                }
            });
        });
    }
    private nbOfStonePerPlayer(nbStone: number): Promise<void> {
        return new Promise<void>((resolve) => {
            let player1Ready = false;
            let player2Ready = false;
            this.player1.setStones(nbStone, '').then(() => {
                player1Ready = true;
                if (player1Ready && player2Ready) {
                    resolve();
                    return;
                }
            });
            this.player2.setStones(nbStone, '#673AB7').then(() => {
                player2Ready = true;
                if (player1Ready && player2Ready) {
                    resolve();
                    return;
                }
            });
        });
    }
    private initPlayersBroom(): Promise<void> {
        return new Promise<void>((resolve) => {
            let player1Ready = false;
            let player2Ready = false;
            this.player1.initBroom().then(() => {
                player1Ready = true;
                if (player1Ready && player2Ready) {
                    resolve();
                    return;
                }
            });
            this.player2.initBroom().then(() => {
                player2Ready = true;
                if (player1Ready && player2Ready) {
                    resolve();
                    return;
                }
            });
        });
    }
    private stoneFollower(stone: CurlingStone, cam: THREE.Camera) {
        // a revoir
        const control = this.curlingService.getControls();
        let pos = stone.getPostion();
        if (stone.getSpeedNorm() === 0 ){
            const activeObj = this.physicWorld.getMostActiveObject();
            if (activeObj){
                pos = activeObj.getPostion();
            }
        }
        control.object.position.set(cam.position.x, 400, -25); // -25 z
        control.target = new THREE.Vector3(pos.x, pos.y, pos.z);
        cam.position.set(pos.x, 400, -25);
    }
    private updateTurn() {
        if (this.subTurn < 2) {
            ++this.subTurn;
        } else {
            ++this.round;
            this.subTurn = 1;
            this.setNextPlayer();
        }
    }
    private setNextPlayer(): void {
        if (this.currentPlayer === null) {
            if (Math.random() > 0.5) {
                this.currentPlayer = this.player1;
            } else {
                this.currentPlayer = this.player2;
            }
        } else {
            if (this.currentPlayer === this.player1) {
                this.currentPlayer = this.player2;
            } else {
                this.currentPlayer = this.player1;
            }

        }
    }
    private gameLoop() {
        const cam = this.curlingService.getCamera();
        const startPos = cam.position.clone();
        this.setNextPlayer();
        const loop = () => {
            if (this.player1.hasStones() || this.player2.hasStones()) {
                console.log(this.player1.hasStones());
                console.log(this.player2.hasStones());
                this.updateTurn();
                let stopping = false;
                cam.position.set(startPos.x, startPos.y, startPos.z);
                this.currentPlayer.startAiming(cam, this.curlingService.renderer).then(() => {
                    this.curlingService.stoneFollower = () => {
                        this.stoneFollower(this.currentPlayer.getCurrentStone(), cam);
                        if ( !stopping && this.physicWorld.areAllObjectsStopped()) {
                            stopping = true;
                            setTimeout(() => {
                                this.curlingService.stoneFollower = null;
                                const control = this.curlingService.getControls();
                                control.target.x = 0;
                                control.target.y = 0;
                                control.target.z = 0;
                                loop();
                            }, 3000);
                        }
                    };
                    this.currentPlayer.startSweeping(cam, this.curlingService.renderer);
                });
            }else {
                console.log('Should handle end');
                this.handleEnd();
            }
        };
        loop();
    }
    public startGame() {
        this.curlingService.moveCameraToStartLocation().then(() => {
            this.curlingService.setSkyboxRotation(true);
            this.gameLoop();
        });
        const scene = this.curlingService.getScene();
        this.player1.getStones().forEach((value: CurlingStone) => {
            scene.add(value.getMesh());
            this.physicWorld.addObject(value);
        });
        this.player2.getStones().forEach((value: CurlingStone) => {
            scene.add(value.getMesh());
            this.physicWorld.addObject(value);
        });
        scene.add(this.player1.getBroom().getMesh());
        scene.add(this.player2.getBroom().getMesh());
        scene.add(this.player1.getArrow().getArrow());
        scene.add(this.player2.getArrow().getArrow());
    }
    public getRound(){
        return this.round;
    }
    public getSubTurn(){
        return this.subTurn;
    }
    private handleEnd() {
        this.lookAtCircle();
        const allStones = this.physicWorld.getStonesInCircle() as CurlingStone[];
        if (allStones.length > 0) {
            const winner = allStones[0].getOwner();
            const winnerStones = allStones.filter ((stone: CurlingStone) => {
                return stone.getOwner() === winner;
            });
            winnerStones.forEach( (stone: CurlingStone) => {
                stone.doVictoryAnimation();
            });
            alert(this.winLabel + ' ' + winner + ' !');
        }
        else {
            alert(this.winLabel + ' None !');
        }
    }
    private lookAtCircle(): void {
        const control = this.curlingService.getControls();
        const pos = new THREE.Vector3(Constant.GOAL_CENTER_X, 0 , 0);
        const cam = this.curlingService.getCamera();
        control.object.position.set(cam.position.x, 400, -25); // -25 z
        control.target = new THREE.Vector3(pos.x, pos.y, pos.z);
        cam.position.set(pos.x, 400, -25);
    }
    public setWinLabel(label: string) {
        this.winLabel = label;
    }
}
