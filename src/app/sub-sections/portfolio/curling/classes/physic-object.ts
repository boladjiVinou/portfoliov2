import * as THREE from 'three';

export abstract class PhysicObject {
    private time = 0;
    private initPos: THREE.Vector3;
    private initSpeed: THREE.Vector3 = new THREE.Vector3();
    protected speed: THREE.Vector3 = new THREE.Vector3();
    private acceleration: THREE.Vector3 = new THREE.Vector3();
    private angularSpeed = 0;
    private initAngularSpeed = 0;
    private canCheckDisappearing = false;
    private theta = 0;
    private angularAcceleration: number;
    protected isFadingOut = false;
    protected abstract getHeritedMesh(): THREE.Object3D;
    public abstract getPostion(): THREE.Vector3;
    public abstract setPostion(pos: THREE.Vector3);
    public abstract isVisible(): boolean;
    public abstract getBoundingBox(): THREE.Box3;
    public abstract getId(): string;
    protected abstract makeDisappear();
    public getFadingState(): boolean {
        return this.isFadingOut;
    }
    public getTheta(): number {
        const v1 = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
        if (v1 > 0) {
            const pos = this.getSpeed().normalize();
            const zAxis = new THREE.Vector3(1, 0, 0); // 0 0 1
            return pos.angleTo(zAxis);
        } else {
            return 0;
        }
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
        this.speed.x = speed.x;
        this.speed.y = speed.y;
        this.speed.z = speed.z;
        this.setAcceleration(this.speed.clone().normalize().multiplyScalar(-450));
        this.time = 0;
        this.initPos = this.getPostion().clone();
        this.initSpeed = this.speed.clone();
    }
    public getAcceleration(): THREE.Vector3 {
        return this.acceleration;
    }
    public getSpeed(): THREE.Vector3 {
        return this.speed.clone();
    }
    public makeDisappearIfNeeded() {
        if (this.canCheckDisappearing && this.isVisible()) {
            const position = this.getPostion();
            if ((position.z > 70 || position.z < -100)) {
                this.makeDisappear();
            } else if ((Math.round(Math.sqrt(Math.pow( this.speed.x, 2) + Math.pow( this.speed.z , 2))) <= 0)
            && (position.x > -220 || position.x < -320)) {
                this.makeDisappear();
            }
        }
    }
    public updatePosition(deltaTime: number) {
        const norm = Math.round(Math.sqrt(Math.pow( this.speed.x , 2) + Math.pow( this.speed.z , 2)));
        const normInitSpeed = Math.round(Math.sqrt(Math.pow( this.initSpeed.x , 2) + Math.pow( this.initSpeed.z , 2)));
        if (norm > 10) {
            // p = (1/2)at^2+vt+p0
           this.time += deltaTime;
           const position = this.acceleration.clone()
           .multiplyScalar( this.time * this.time)
           .multiplyScalar(0.5)
           .add(this.initSpeed.clone()
           .multiplyScalar( this.time))
           .add(this.initPos.clone());
           this.setPostion(position);
            // v = at + v0
           const speed = this.acceleration.clone()
                .multiplyScalar(this.time)
                .add(this.initSpeed.clone());
            // 90 -theta: angle avec axe horizontale
           if (this.theta !== 0) {
               const malus = Math.cos((Math.PI / 2) - this.theta) * (this.angularSpeed);
               if (this.angularSpeed > 0 ) {
                speed.z += malus;
               } else {
                speed.z -= malus;
               }
            }
           this.setSpeed(speed);
        } else {
            this.speed.set(0, 0, 0);
            if (normInitSpeed) {
                this.angularSpeed = 0;
            }
        }
        this.rotate(deltaTime);
        this.makeDisappearIfNeeded();
    }

}
