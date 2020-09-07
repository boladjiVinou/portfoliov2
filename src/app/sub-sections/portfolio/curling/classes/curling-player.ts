import { CurlingStone, StoneState } from './curling-stone';
import { CurlingBroom } from './curling-broom';
import { CurlingArrow } from './curling-arrow';
import * as THREE from 'three';
import { PhysicWorld } from './physic-world';
import { STONE_INIT_X, STONE_INIT_Y, STONE_INIT_Z } from './Constant';
import { isArray } from 'util';

export abstract class CurlingPlayer {
    protected playerName = '';
    protected broom: CurlingBroom;
    protected isAiming = false;
    protected hasShootStone = false;
    protected shootPower = 0;
    protected currentStoneIndex = -1;
    protected stones: CurlingStone[];
    protected arrow = new CurlingArrow();
    protected aimingInterval: any;
    protected arrowUpdater: EventListener;
    protected shootIncreaserInterval: any;
    public abstract startAiming(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void>;
    public abstract startSweeping(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void>;
    public abstract destroy();
    public setName(name: string) {
        this.playerName = name;
    }
    public initStonesNames() {
        this.stones.forEach((value: CurlingStone, index: number) => {
            value.getMesh().name = this.playerName + '_stone' + index;
        });
    }
    public setStones(nb: number, color: string): Promise<void> {
        return new Promise<void>((resolve) => {
            this.stones = [];
            const stoneModel = new CurlingStone();
            stoneModel.init(color).then(() => {
                for (let i = 0; i < nb; i++) {
                    this.stones.push(stoneModel.clone());
                }
                resolve();
                return;
            });
        });
    }
    public getCurrentStone(): CurlingStone {
        if (this.currentStoneIndex < this.stones.length) {
            return this.stones[this.currentStoneIndex];
        } else {
            return null;
        }
    }
    public initBroom(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.broom = new CurlingBroom();
            this.broom.init().then(() => {
                resolve();
                return;
            });
        });
    }
    public getBroom(): CurlingBroom {
        return this.broom;
    }
    public getStones(): CurlingStone[] {
        return this.stones;
    }
    public getRemainingNbStones(): Array<number>{
        return  new Array(this.stones.length - (this.currentStoneIndex + 1));
    }
    public getArrow(): CurlingArrow {
        return this.arrow;
    }
    public getName() {
        return this.playerName;
    }

}


export class HumanCurlingPlayer extends CurlingPlayer {

    public startAiming(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void> {
        return new Promise<void>((resolve) => {
            this.isAiming = true;
            this.currentStoneIndex++;
            this.stones[this.currentStoneIndex].getMesh().position.set(STONE_INIT_X, STONE_INIT_Y, STONE_INIT_Z);
            this.stones[this.currentStoneIndex].getMesh().visible = true;
            this.arrow.getArrow().visible = true;
            // actualisation de la fleche
            this.arrowUpdater = (event: MouseEvent) => {
                this.arrow.updateArrowDirection(event, cam, renderer);
            };
            window.addEventListener('mousemove', this.arrowUpdater);
            // actualisation de la barre
            const progressBar = document.getElementById('real-progress-div');
            const progressBarParent = document.getElementById('shooting-progress-div');
            progressBarParent.style.display = 'flex';
            const increaser = () => {
                this.shootIncreaserInterval = setInterval(() => {
                    if (this.shootPower + 5 <= 100) {
                        this.shootPower += 5;
                    } else {
                        this.shootPower = 0;
                    }
                    progressBar.style.width = this.shootPower.toString() + '%';
                }, 200);
            };
            let angularSpeed = 10;
            let counter = 0;
            // sensibilite pour la rotation
            const rotator = (ev: KeyboardEvent) => {
                if (ev.key === 's') {
                    ++counter;
                    if (counter < 3) {
                        angularSpeed *= -1;
                        this.getCurrentStone().setAngularSpeed(angularSpeed);
                    } else {
                        this.getCurrentStone().setAngularSpeed(0);
                        angularSpeed = 10;
                        counter = 0;
                    }
                }
            };
            // arret des actualisations
            const increaserStopper = () => {
                if (this.shootPower > 0) {
                    progressBarParent.style.display = 'none';
                    clearInterval(this.shootIncreaserInterval);
                    this.shootIncreaserInterval = null;
                    this.stones[this.currentStoneIndex].setSpeed(this.arrow.getDirection().multiplyScalar(this.shootPower * 12));
                    this.shootPower = 0;
                    progressBar.style.width = this.shootPower.toString() + '%';
                    window.removeEventListener('mousedown', increaser);
                    window.removeEventListener('mouseup', increaserStopper);
                    window.removeEventListener('keypress', rotator);
                    this.arrow.getArrow().visible = false;
                    this.stones[this.currentStoneIndex].setDisapearingChecker(true);
                    resolve();
                    return;
                } else {
                    clearInterval(this.shootIncreaserInterval);
                }
            };
            window.addEventListener('keypress', rotator);
            window.addEventListener('mousedown', increaser);
            window.addEventListener('mouseup', increaserStopper);
        });
    }
    public startSweeping(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void> {
        this.broom.setUpdateCancel(false);
        return new Promise<void>((resolve) => {
            let previousState = StoneState.unused;
            const subscription = this.getCurrentStone().trackState().subscribe((state: StoneState) => {
                if (state === StoneState.isInBroomZone  && state !== previousState)
                {
                    if (!this.broom.getMesh().visible)
                    {
                        this.broom.activateBroom(cam, renderer);
                    }
                }
                else if ( (previousState === StoneState.isInBroomZone && state !== StoneState.isInBroomZone)
                || state === StoneState.isStopped )
                {
                    this.broom.setUpdateCancel(true);
                    this.broom.desactivateBroom(renderer);
                    subscription.unsubscribe();
                    resolve();
                    return;
                }
                previousState = state;
            });
        });
    }
    public destroy(): void {
        this.stones.forEach(element => {
            element.destroy();
        });
        if (this.shootIncreaserInterval) {
            clearInterval(this.shootIncreaserInterval);
        }
    }
}


export class AICurlingPlayer extends CurlingPlayer {
    private physicWorld: PhysicWorld = null;
    private difficulty = 0;
    public constructor(difficultyLevel: number, physicWorld: PhysicWorld) {
        super();
        this.difficulty = difficultyLevel;
        this.physicWorld = physicWorld;
    }

    public startAiming(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void> {
        return new Promise<void>((resolve) => {
            this.currentStoneIndex++;
            this.stones[this.currentStoneIndex].getMesh().position.set(STONE_INIT_X, STONE_INIT_Y, STONE_INIT_Z);
            this.stones[this.currentStoneIndex].getMesh().visible = true;
            this.arrow.getArrow().visible = true;
            const destination = this.physicWorld.generateDesiredPosition(this.difficulty);
            const speed = this.physicWorld.computeInitialSpeed(destination, new THREE.Vector3(STONE_INIT_X, STONE_INIT_Y, STONE_INIT_Z));
            const speedMagn = Math.round(Math.sqrt(Math.pow( speed.x , 2) + Math.pow( speed.z , 2)));
            // actualisation de la ligne de visee
            this.arrow.simulateArrowUpdate(speed.clone().normalize()).then(() => {
                // actualisation de la barre de tir
                const progressBar = document.getElementById('real-progress-div');
                const progressBarParent = document.getElementById('shooting-progress-div');
                progressBarParent.style.display = 'flex';
                this.shootPower = 0;
                const increaser = () => {
                    this.shootIncreaserInterval = setInterval(() => {
                        if (this.shootPower * 10.1 < speedMagn) {
                            if (this.shootPower + 5 <= 100) {
                                this.shootPower += 5;
                                if (speedMagn > 1010 && this.shootPower === 100) {
                                    this.stones[this.currentStoneIndex].setSpeed(this.arrow.getDirection().multiplyScalar(speedMagn));
                                    this.shootPower = 0;
                                    this.arrow.getArrow().visible = false;
                                    this.stones[this.currentStoneIndex].setDisapearingChecker(true);
                                    progressBarParent.style.display = 'none';
                                    resolve();
                                    clearInterval(this.shootIncreaserInterval);
                                    this.shootIncreaserInterval = null;
                                }
                            } else {
                                this.shootPower = 0;
                            }
                            progressBar.style.width = this.shootPower.toString() + '%';
                        } else {
                            this.stones[this.currentStoneIndex].setSpeed(this.arrow.getDirection().multiplyScalar(speedMagn));
                            this.shootPower = 0;
                            this.arrow.getArrow().visible = false;
                            this.stones[this.currentStoneIndex].setDisapearingChecker(true);
                            progressBarParent.style.display = 'none';
                            progressBar.style.width = this.shootPower.toString() + '%';
                            resolve();
                            clearInterval(this.shootIncreaserInterval);
                            this.shootIncreaserInterval = null;
                        }
                    }, 200);
                };
                setTimeout(() => {
                    increaser();
                }, 300);
            });
        });
    }

    public startSweeping(cam: THREE.Camera, renderer: THREE.WebGLRenderer): Promise<void> {
        this.broom.setUpdateCancel(false);
        return new Promise<void>((resolve) => {
            let previousState = StoneState.unused;
            const subscription = this.getCurrentStone().trackState().subscribe((state: StoneState) => {
                if (state === StoneState.isInBroomZone && state !== previousState)
                {
                    if (!this.broom.getMesh().visible)
                    {
                        this.broom.simulateBroomMovements(this.getCurrentStone());
                    }
                }
                else if ( (previousState === StoneState.isInBroomZone && state !== StoneState.isInBroomZone)
                 || state === StoneState.isStopped )
                {
                    this.broom.setUpdateCancel(true);
                    this.broom.stopBroomSimulation();
                    subscription.unsubscribe();
                    resolve();
                    return;
                }
                previousState = state;
            });
        });
    }

    public destroy() {
        this.stones.forEach(element => {
            element.destroy();
        });
        if (this.shootIncreaserInterval) {
            clearInterval(this.shootIncreaserInterval);
        }
    }
}
