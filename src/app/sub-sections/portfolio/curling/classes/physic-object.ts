import * as THREE from 'three';
import * as Constant from './Constant';
import { Mesh } from 'three';
export abstract class PhysicObject {
    private time = 0;
    protected speed: THREE.Vector3 = new THREE.Vector3();
    private acceleration: THREE.Vector3 = new THREE.Vector3();
    private speedNorm = 0;
    private angularSpeed = 0;
    private initAngularSpeed = 0;
    private normInitSpeed = 0;
    private canCheckDisappearing = false;
    private theta = 0;
    private angularAcceleration: number;
    protected isFadingOut = false;
    protected  realObject: THREE.Object3D = null;
    public abstract getId(): string;
    protected abstract makeDisappear();
    public getFadingState(): boolean {
        return this.isFadingOut;
    }
    public getTheta(): number {
        const v1 = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
        if (v1 > 0) {
            const pos = this.getSpeed().normalize();
            const xAxis = new THREE.Vector3(-1, 0, 0); // 0 0 1
            return pos.angleTo(xAxis);
        } else {
            return 0;
        }
    }
    public setRealObject(object: THREE.Object3D) {
        this.realObject = object;
    }
    public getBoundingBox(): THREE.Box3 {
        return new THREE.Box3().setFromObject(this.realObject);
    }
    public getPostion(): THREE.Vector3 {
        return this.realObject.position.clone();
    }
    public setPostion(pos: THREE.Vector3) {
        this.realObject.position.x = pos.x;
        this.realObject.position.y = pos.y;
        this.realObject.position.z = pos.z;
    }
    protected getHeritedMesh(): THREE.Object3D {
        return this.realObject;
    }
    public setDisapearingChecker( val: boolean) {
        this.canCheckDisappearing = val;
    }
    public getAlpha(): number {
        const pos = this.getSpeed().normalize();
        const xAxis = new THREE.Vector3(1, 0, 0);
        return pos.angleTo(xAxis);
    }
    public setAngularSpeed(speed: number) {
        this.angularSpeed = speed;
        this.initAngularSpeed = speed;
        if (speed > 0) {
            this.angularAcceleration = -2;
        } else {
            this.angularAcceleration = 2;
        }
    }
    public getAngularSpeed(): number {
        return this.angularSpeed;
    }
    public rotate(deltaTime) {
        if (Math.abs(this.angularSpeed) > 0.01) {
            const norm = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
            if (norm > 10) {
                this.angularSpeed += this.angularAcceleration * deltaTime;
            }
            this.theta = this.angularSpeed * deltaTime;
            const mesh = this.getHeritedMesh();
            mesh.rotateY(this.theta);
        } else {
            this.theta = 0;
         }
    }
    public setAcceleration(acc: THREE.Vector3) {
        this.acceleration.x = acc.x;
        this.acceleration.y = acc.y;
        this.acceleration.z = acc.z;
    }
    public setSpeed(speed: THREE.Vector3) {
        this.normInitSpeed = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
        this.speed.x = speed.x;
        this.speed.y = speed.y;
        this.speed.z = speed.z;
        this.setAcceleration(this.speed.clone().normalize().multiplyScalar(Constant.ACCELERATION));
        this.time = 0;
    }
    public AddSpeed(deltaSpeed: THREE.Vector3){
        this.speed.x += deltaSpeed.x;
        this.speed.y += deltaSpeed.y;
        this.speed.z += deltaSpeed.z;
        this.setAcceleration(this.speed.clone().normalize().multiplyScalar(Constant.ACCELERATION));
    }
    public getAcceleration(): THREE.Vector3 {
        return this.acceleration;
    }
    public getSpeed(): THREE.Vector3 {
        return this.speed.clone();
    }
    public getSpeedNorm(): number{
        return this.speedNorm;
    }
    public makeDisappearIfNeeded() {
        if (this.canCheckDisappearing && this.isVisible()) {
            const position = this.getPostion();
            const z = Constant.RUNWAY_WIDTH / 2;
            const xMax = Constant.GOAL_CENTER_X - Constant.GOAL_RADIUS + 3;
            const xMin = Constant.GOAL_CENTER_X + Constant.GOAL_RADIUS - 3;
            if ((position.z > z || position.z < -z)) {
                this.makeDisappear();
            } else if (((Math.round(Math.sqrt(Math.pow( this.speed.x, 2) + Math.pow( this.speed.z , 2))) <= 0)
            && position.x > xMin) || position.x < xMax) {
                this.makeDisappear();
            }
        }
    }
    public updatePosition(deltaTime: number) {
        this.speedNorm = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
        if (this.speedNorm > 10) {
            // p = (1/2)at^2+vt+p0
           const deltaPos = this.acceleration.clone()
           .multiplyScalar( deltaTime * deltaTime)
           .multiplyScalar(0.5)
           .add(this.speed.clone()
           .multiplyScalar( deltaTime));
           this.realObject.position.add(deltaPos);
            // v = at + v0
           const speed = this.acceleration.clone()
                .multiplyScalar(deltaTime);
            // 90 -theta: angle avec axe horizontale
           if (this.theta !== 0) {
               const malus = Math.cos((Math.PI / 2) - this.theta) * (this.angularSpeed);
               if (this.angularSpeed > 0 ) {
                speed.z += malus;
               } else {
                speed.z -= malus;
               }
            }
           this.AddSpeed(speed);
        } else if (this.speedNorm !== 0) {
            this.speed.set(0, 0, 0);
            this.angularSpeed = 0;
            this.speedNorm = 0;
        }
        this.rotate(deltaTime);
        this.makeDisappearIfNeeded();
    }

    public isVisible(): boolean {
        return this.realObject.visible;
    }

}
