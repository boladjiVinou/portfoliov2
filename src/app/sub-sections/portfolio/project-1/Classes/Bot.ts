import * as THREE from 'three';
import { OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import { Object3D, OneFactor} from 'three';
import { Tire } from './Tire';
import { IrSensor } from './IrSensor';
import { TapeSensor } from './TapeSensor';
export class Bot {
    private loader1: OBJLoader = new OBJLoader();
    private matLoader: MTLLoader = new MTLLoader();
    private bot: THREE.Object3D;
    private irSensor: IrSensor;
    private tapeSensor: TapeSensor;
    private tire1: Tire;
    private tire2: Tire;
    private atPhase1 = true;
    private atPhase2Transition = false;
    private atPhase2 = false;
    private canMove = false;
    private rayDirectionChanged = false;
    private phase1Targets: Object3D[];
    private phase2Targets: Object3D[];
    private phase1Data: number[] = [];
    private phase2Data: number[] = [];
    private startingRotation: THREE.Euler;
    public buildBot(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.matLoader.setPath('../../../assets/arduino+uno11/');
            this.matLoader.load('arduino.mtl', (materials: { preload: () => void; }) => {
                materials.preload();
                this.loader1.setMaterials(materials  as MTLLoader.MaterialCreator);
                this.loader1.load('../../../assets/arduino+uno11/arduino.obj', (card: Object3D) => {
                    this.tire1 = new Tire();
                    this.tire1.init().then((value: THREE.Object3D) => {
                        this.tire2 = this.tire1.clone();
                        this.tire1.getMesh().position.set(-4, -1, -1.5);
                        this.tire2.getMesh().position.set(-9.8, -1, -1.5);
                        this.bot = this.buildBotFrame();
                        card.scale.set(0.001, 0.002, 0.002);
                        card.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2 );
                        card.position.set(-2, -2, 1.2);

                        this.bot.add(card);
                        this.bot.add(this.tire1.getMesh());
                        this.bot.add(this.tire2.getMesh());
                        this.bot.rotateX(-Math.PI / 2);
                        this.startingRotation = this.bot.rotation.clone();
                        this.bot.position.set(0, 36.7, 55);
                        resolve();
                        return;
                    });

            }, null , (error: ErrorEvent) => {
                console.log(error);
            });
        });
        });
    }
    public resetBot() {
        this.bot.position.set(0, 36.7, 55);
        this.bot.rotation.set(this.startingRotation.x, this.startingRotation.y, this.startingRotation.z);
        if (this.irSensor.getRay() !== undefined) {
            this.irSensor.getRay().setNeedToInvertDirection(false);
        }
        this.phase1Data = [];
        this.phase2Data = [];
        this.canMove = false;
        this.atPhase1 = true;
        this.atPhase2Transition = false;
        this.atPhase2 = false;
    }
    public getMesh(): THREE.Object3D {
        return this.bot;
    }
    private buildBotFrame(): THREE.Object3D {
        const base1Geo = new THREE.BoxGeometry(5, 3, 0.25);
        const base1Mat = new THREE.MeshLambertMaterial({color: 0xE53935});
        const base = new THREE.Mesh(base1Geo, base1Mat);

        const baseUp = base.clone();
        const supportGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
        const supportMat = new THREE.MeshLambertMaterial({color: 0x000000});
        const support1 = new THREE.Mesh(supportGeo, supportMat);
        support1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        const support2 = support1.clone();
        const support3 = support1.clone();
        const support4 = support1.clone();
        support1.position.set(-2.45, -1.45, 0.625);
        support2.position.set(-2.45, 1.45, 0.625);
        support3.position.set(2.45, -1.45, 0.625);
        support4.position.set(2.45, 1.45, 0.625);
        base.add(support1);
        base.add(support2);
        base.add(support3);
        base.add(support4);
        baseUp.position.set(0, 0, 1.15);
        base.add(baseUp);
        const cylGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.15, 32);
        const cylMat = new THREE.MeshLambertMaterial({color: 0xE53935});
        const front = new THREE.Mesh(cylGeo, cylMat);
        front.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        const frontTireBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
        const frontTireBaseMat = new THREE.MeshLambertMaterial({color: 0x000000});
        const frontTireBase = new THREE.Mesh(frontTireBaseGeo, frontTireBaseMat);
        const frontTireGeo = new THREE.SphereGeometry(0.2, 32);
        const frontTireMat = new THREE.MeshLambertMaterial({color: 0xFFC107});
        const frontTire = new THREE.Mesh(frontTireGeo, frontTireMat);
        frontTire.position.set(0, -0.7, 0);
        frontTireBase.add(frontTire);
        frontTireBase.updateMatrixWorld();
        frontTireBase.position.set(0, -0.65, -1.2);

        this.tapeSensor = new TapeSensor();
        this.irSensor = new IrSensor();
        front.add(frontTireBase);
        this.irSensor.getMesh().position.set(0, 0.65, -2.2);
        front.add(this.irSensor.getMesh());
        front.add(this.tapeSensor.getMesh());
        front.position.set(0, 1.5, 0);
        base.add(front);
        return base;
    }
    public setPhase1Target(phase1Targets: Object3D[]) {
        this.phase1Targets = phase1Targets;
    }
    public setPhase2Target(phase2Targets: Object3D[]) {
        this.phase2Targets = phase2Targets;
    }
    public setCanMove(canMove: boolean) {
        this.canMove = canMove;
    }
    private updatePosition(): void {
        if (this.atPhase1) {
            this.bot.position.z -= 0.1;
            this.atPhase1 = (this.bot.position.z > -57);
            this.irSensor.getRay().setTargets(this.phase1Targets);
        } else {
            if (!this.atPhase2) {
                this.bot.rotateZ(Math.PI / 100);
                this.atPhase2 = (this.bot.rotation.z >= (Math.PI - (Math.PI / 100)));
                if (this.atPhase2) {
                    this.bot.rotation.z = Math.PI;
                    this.irSensor.getRay().setTargets(this.phase2Targets);
                    this.irSensor.getRay().setNeedToInvertDirection(true);
                }
            } else {
                this.bot.position.z += 0.1;
                this.atPhase2 = (this.bot.position.z < 57);
                if (!this.atPhase2) {
                    this.canMove = false;
                }
            }
        }
    }
    public getIrSensor(): IrSensor {
        return this.irSensor;
    }
    public isAbleToMove(): boolean {
        return this.canMove;
    }
    public isInPhase1(): boolean {
        return this.atPhase1;
    }
    public isInPhase2(): boolean {
        return this.atPhase2;
    }
    public animate(): void {
        if (this.canMove) {
            this.irSensor.animate();
            /*const lastValue = this.irSensor.getRay().getLastReadValue();
            if (this.atPhase1) {
                this.phase1Data.push(lastValue);
            } else if (this.atPhase2) {
                this.phase2Data.push(lastValue);
            }*/
            this.tapeSensor.animate();
            this.tire1.animate();
            this.tire2.animate();
            this.updatePosition();
        }

    }
}
