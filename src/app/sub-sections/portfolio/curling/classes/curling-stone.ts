import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';
import * as THREE from 'three';
import { PhysicObject } from './physic-object';
import { isArray } from 'util';
export enum StoneState {
    isStopped = 1,
    isInPointsZone
}
export class CurlingStone extends PhysicObject {
    private loader1: OBJLoader = new OBJLoader();
    private matLoader: MTLLoader = new MTLLoader();
    private secondSens = false;
    tracker: any;
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
            console.log('making disappear stone ' + this.realObject.uuid);
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
                console.log('reducing visibility');
                this.realObject.traverse((child: THREE.Object3D) => {
                    // tslint:disable-next-line:no-string-literal
                    if ( (child as THREE.Mesh).material && (child as THREE.Mesh).material['opacity'] > 0) {
                        // tslint:disable-next-line:no-string-literal
                        (child as THREE.Mesh).material['opacity'] -= 0.01;
                    }
                });
            } else {
                console.log('stone should disappear');
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
        }else{
            console.log('making disappear fail');
        }
    }
    private isInPointZone(position: THREE.Vector3): boolean {
        const center = new THREE.Vector3(-294, 19, -20);
        const distance = Math.pow((position.x - center.x), 2) + Math.pow((position.z  - center.z), 2);
        return distance < 70;
    }
    public trackState(): Promise<StoneState> {
        return new Promise<StoneState>((resolve) => {
            const stateTracker = () => {
                if (this.isInPointZone(this.getPostion()) &&
                                (Math.round(Math.sqrt(Math.pow( this.speed.x, 2) + Math.pow( this.speed.z , 2))) <= 0)) {
                    console.log('point zone');
                    resolve(StoneState.isInPointsZone);
                    clearInterval(this.tracker);
                    this.tracker = null;
                    return;
                } else if (Math.round(Math.sqrt(Math.pow( this.speed.x, 2) + Math.pow( this.speed.z , 2))) <= 0) {
                    console.log('stone stopped');
                    resolve(StoneState.isStopped);
                    clearInterval(this.tracker);
                    this.tracker = null;
                    return;
                }
            };
            this.tracker = setInterval(stateTracker, 30);
        });
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
                    o.material = o.material.clone();
                } else {
                    o.material.forEach((value: THREE.Material) => {
                        value = value.clone();
                    });
                }
            }
        });
        return stone;
    }
    public getMesh(): THREE.Object3D {
        return this.realObject;
    }
    public destroy(): void {
        if (this.tracker) {
            clearInterval(this.tracker);
        }
    }
}
