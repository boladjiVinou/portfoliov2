import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';
import * as THREE from 'three';
import { PhysicObject } from './physic-object';
import { isArray } from 'util';
import { BehaviorSubject, Observable } from 'rxjs';

import * as Constant from './Constant';
export enum StoneState {
    unused = 1,
    isStopped,
    isInPointsZone,
    isInBroomZone,
    isRunning
}
export class CurlingStone extends PhysicObject {
    private loader1: OBJLoader = new OBJLoader();
    private matLoader: MTLLoader = new MTLLoader();
    private tracker: any;
    private victoryAnimater: any;
    private state = new BehaviorSubject<StoneState>(StoneState.unused);
    private owner: string;
    public init(color: string): Promise<void> {
        return new Promise<void>((resolve) => {
            this.matLoader.setPath('../../../../../../assets/curling/curling_Stone/');
            this.matLoader.load('curlingStone.mtl',
                     (materials: { preload: () => void; }) => {
                 materials.preload();
                 this.loader1.setMaterials(materials);
                 this.loader1.load('../../../../../../assets/curling/curling_Stone/curlingStone.obj', (stone: THREE.Mesh) => {
                     stone.rotateX(-Math.PI / 2);
                     stone.scale.set(50, 50, 50);
                     const box = new THREE.Box3().setFromObject(stone);
                     const center = box.getCenter(stone.position);
                     stone.position.set(center.x, center.y, center.z);
                     stone.position.multiplyScalar(-1);
                     const realStone = new THREE.Object3D();
                     realStone.add(stone);
                     realStone.visible = false;
                     if (color.length > 0) {
                        realStone.traverse((val: THREE.Mesh) => {
                            if (val.material && !Array.isArray(val.material)) {
                                // tslint:disable-next-line:no-string-literal
                               val.material['color'] = new THREE.Color(color);
                               val.material.needsUpdate = true;
                            }
                        });
                     }
                     this.setRealObject(realStone);
                     resolve();
                     return;
                 });
            });
        });
    }
    protected makeDisappear() {
        let shouldNotDisappear = false;
        if (this.realObject !== undefined) {
            this.realObject.traverse((child: THREE.Mesh) => {
                // tslint:disable-next-line:no-string-literal
                if ( child.material && child.material['opacity'] > 0) {
                    shouldNotDisappear = true;
                }
                if ( child.material) {
                    // tslint:disable-next-line:no-string-literal
                    child.material['transparent'] = true;
                }
            });
            this.realObject.visible = shouldNotDisappear;
            if (this.realObject.visible) {
                this.isFadingOut = true;
                this.realObject.traverse((child: THREE.Object3D) => {
                    // tslint:disable-next-line:no-string-literal
                    if ( (child as THREE.Mesh).material && (child as THREE.Mesh).material['opacity'] > 0) {
                        // tslint:disable-next-line:no-string-literal
                        (child as THREE.Mesh).material['opacity'] -= 0.01;
                    }
                });
            } else {
                this.realObject.traverse((child: THREE.Object3D) => {
                    // tslint:disable-next-line:no-string-literal
                    if ( (child as THREE.Mesh).material && (child as THREE.Mesh).material['opacity'] <= 0) {
                        // tslint:disable-next-line:no-string-literal
                        (child as THREE.Mesh).material['opacity'] = 1;
                    }
                });
                this.setSpeed(new THREE.Vector3());
                this.isFadingOut = false;
            }
        }
    }
    private isInPointZone(position: THREE.Vector3): boolean {
        const center = new THREE.Vector3(-294, 19, -20);
        const distance = Math.pow((position.x - center.x), 2) + Math.pow((position.z  - center.z), 2);
        return distance < 70;
    }
    private  isInBroomSection(): boolean
    {
        const x = this.realObject.position.x;
        return x < Constant.FIRST_LINE_X && x > Constant.SECOND_LINE_X;
    }
    public trackState(): Observable<StoneState> {
        const stateTracker = () => {
            if (Math.round(Math.sqrt(Math.pow( this.speed.x, 2) + Math.pow( this.speed.z , 2))) <= 0) {
                console.log('stone stopped');
                this.state.next(StoneState.isStopped);
                clearInterval(this.tracker);
                this.tracker = null;
                return;
            }
            else if (this.isInBroomSection())
            {
                this.state.next(StoneState.isInBroomZone);
            }
            else {
                this.state.next(StoneState.isRunning);
            }
        };
        this.tracker = setInterval(stateTracker, 30);
        return this.state.asObservable();
    }
    public getId(): string {
        return this.realObject.name.toString();
    }
    public clone(): CurlingStone {
        const stone = new CurlingStone();
        stone.setRealObject(this.realObject.clone(true));
        stone.realObject.traverse((o: THREE.Mesh) => {
            if (o.material) {
                if (!isArray(o.material)) {
                    o.material = (o.material as THREE.Material) .clone();
                } else {
                    (o.material as THREE.Material[]).forEach((value: THREE.Material) => {
                        value = value.clone();
                    });
                }
            }
        });
        return stone;
    }
    public doVictoryAnimation() {
        const yMin = this.realObject.position.y;
        const yMax = yMin + 10;
        let sens  = 1;
        this.victoryAnimater = setInterval(() => {
            this.realObject.rotateY(Math.PI / 15);
            if (this.realObject.position.y === yMax) {
                sens = -1;
            } else if  (this.realObject.position.y === yMin) {
                sens = 1;
            }
            this.realObject.position.y += (sens);
        }, 50);
    }
    public getMesh(): THREE.Object3D {
        return this.realObject;
    }
    public destroy(): void {
        if (this.tracker) {
            clearInterval(this.tracker);
        }
        if (this.victoryAnimater){
            clearInterval(this.victoryAnimater);
        }
    }
    public setOwner(inOwner: string): void {
        this.owner = inOwner;
    }
    public getOwner(): string {
        return this.owner;
    }
}
