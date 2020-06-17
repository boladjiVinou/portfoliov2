import { PhysicObject } from './physic-object';
import * as THREE from 'three';
import { del } from 'selenium-webdriver/http';
import { prependOnceListener } from 'cluster';

export class PhysicWorld {
    private objects: PhysicObject[] = [];
    private dt = 0.1;
    private collisionBuffer: string[] = [];
    private previousCollisionBuffer: string[] = [];
    private allObjectsAreStopped = false;
    public constructor() {
        this.objects = [];
    }
    public addObject(o: PhysicObject) {
        this.objects.push(o);
    }
    public setDeltaTime(dt: number) {
        this.dt = dt;
    }
    private getStonesInCircle(): PhysicObject[] {
        // centre: -294, 19, -20
        const radius = 70;
        return this.objects.filter((value: PhysicObject) => {
            if (value.isVisible()) {
                const pos = value.getPostion();
                const distance = Math.pow((pos.x + 294), 2) + Math.pow((pos.z + 20), 2);
                return distance <= Math.pow(radius, 2);
            } else {
                return false;
            }
        });
    }
    public generateDesiredPosition(level: number): THREE.Vector3 {
        const center = new THREE.Vector3(-294, 19, -20);
        const stones = this.getStonesInCircle();
        const aiStones = stones.filter((value: PhysicObject) => {
            return value.getId().startsWith('AIPlayer');
        });
        const humanStones = stones.filter((value: PhysicObject) => {
            return !value.getId().startsWith('AIPlayer');
        });
        // 3 difficile
        // centre: -294, 19, -20
        // droite: -297.88 19 -90.7
        // gauche: -297.88 19 90.7
        // devant: -244.6 19 -18
        // derriere: -354.7 19 -18
        // (x + 294.19)^ 2 + (z + 20)^ 2 = 70^2
        const dest = new THREE.Vector3(0, 19, 0);
        let radiusZone = 0;
        switch (level) {
            case 1:
                radiusZone = 75;
                break;
            case 2:
                radiusZone = 50;
                break;
            case 3:
                radiusZone = 25;
                break;
        }
        do {
            const radius = Math.random() * radiusZone;
            const angle = Math.random() * Math.PI * 2;
            dest.x = center.x + radius * Math.cos(angle);
            dest.z = center.z + radius * Math.sin(angle);
            if (level > 1) {
                ++radiusZone;
            }
        } while (aiStones.some((value: PhysicObject) => {
            const valPos = value.getPostion();
            const distance = Math.pow((valPos.x - dest.x), 2) + Math.pow((valPos.z  - dest.z), 2);
            return distance < 20 && (valPos.x > dest.x);
        }));
        return dest;
    }
    public computeInitialSpeed(desiredPos: THREE.Vector3, initPos: THREE.Vector3): THREE.Vector3 {
      // v^2 = v0^2 + 2aDeltaX
      // vo^2 = v^2 - 2aDeltaX
      const deltaPos = desiredPos.clone().sub(initPos);
      const acc = deltaPos.clone().normalize().multiplyScalar(-450);
      const v0Squared = (acc.clone().multiplyScalar(-2)).multiply(deltaPos);
      const result = new THREE.Vector3(-Math.sqrt(v0Squared.x), 0 , Math.sqrt(v0Squared.z));
      if (deltaPos.clone().normalize().z < 0) {
          result.setZ(-result.z);
      }
      return result;
    }
    private getNeighboursOfObject(o: PhysicObject): PhysicObject[] {
        const refBox = o.getBoundingBox();
        return this.objects.filter((val: PhysicObject) => {
            if (val !== o && val.isVisible() && refBox.intersectsBox(val.getBoundingBox())) {
                return true;
            }
        });
    }
    public updateWorld() {
        const objectsToUpdate: PhysicObject[] = [];
        this.collisionBuffer = [];
        let movingObjects = 0;
        this.objects.forEach((value: PhysicObject) => {
            let speed = value.getSpeed();
            let norm = Math.round(Math.sqrt(Math.pow( speed.x , 2) + Math.pow( speed.z , 2)));
            // si l objet actuel se deplace on calcule son impact sur ses voisins si il en a
            if (norm > 0 && value.isVisible()) {
                const neighbours = this.getNeighboursOfObject(value);
                neighbours.forEach((neighbour: PhysicObject) => {
                    const key1 = value.getId() + '_' + neighbour.getId();
                    const key2 = neighbour.getId() + '_' + value.getId();
                    // Je ne veux pas retraiter un choc precedemment trouve lors de cette frame ou celle precedente
                    if (!this.collisionBuffer.some((o: string) => {
                        return (o === key1) || (o === key2);
                    }) && !this.previousCollisionBuffer.some((o: string) => {
                        return (o === key1) || (o === key2);
                    })) {
                        this.handleCollision(value, neighbour);
                        this.collisionBuffer.push(key1);
                    }
                });
            }
            speed = value.getSpeed();
            norm = Math.round(Math.sqrt(Math.pow( speed.x , 2) + Math.pow( speed.z , 2)));
            if (norm > 0 || value.getFadingState()) {
                objectsToUpdate.push(value);
            } else if (value.isVisible()) {
                objectsToUpdate.push(value);
            }
        });
        this.allObjectsAreStopped = (movingObjects === 0);
        objectsToUpdate.forEach((value: PhysicObject) => {
            value.updatePosition(this.dt);
            const speed = value.getSpeed();
            const norm = Math.round(Math.sqrt(Math.pow( speed.x , 2) + Math.pow( speed.z , 2)));
            if (norm > 0 || value.getFadingState() ) {
                ++movingObjects;
            }
        });
        this.allObjectsAreStopped = (movingObjects === 0);
        this.previousCollisionBuffer = [];
        this.collisionBuffer.forEach((value: string) => {
            this.previousCollisionBuffer.push(value);
        });
    }
    public areAllObjectsStopped(): boolean {
        return this.allObjectsAreStopped;
    }
     // Reminder: x positif est vers moi, z positif est a ma gauche, y positif est vers le haut
    private handleCollision(o1: PhysicObject, o2: PhysicObject) {
        const theta1 = o1.getTheta();
        const speed1 = o1.getSpeed();
        const v1 = Math.round(Math.sqrt(Math.pow( speed1.x , 2) + Math.pow( speed1.z , 2)));
        const theta2 = o2.getTheta();
        const speed2 = o2.getSpeed();
        let v2 = Math.round(Math.sqrt(Math.pow( speed2.x , 2) + Math.pow( speed2.z , 2)));
        if (v2 === 0) {
            v2 = 1;
        }
        const newTheta1 = Math.atan(  (v2 / v1) * (Math.sin(theta2) / Math.cos(theta1)));
        const newTheta2 = Math.atan( (v1 / v2) * (Math.sin(theta1) / Math.cos(theta2)));
        const newV1 = Math.sqrt(Math.pow( v2 * Math.sin(theta2), 2) + Math.pow(v1 * Math.cos(theta1), 2));
        const newV2 = Math.sqrt(Math.pow( v1 * Math.sin(theta1), 2) + Math.pow(v2 * Math.cos(theta2), 2));
        const newV1Vector = new THREE.Vector3(newV1 * Math.sin(newTheta1), 0, newV1 * Math.cos(newTheta1));
        const newV2Vector = new THREE.Vector3(newV2 * Math.sin(newTheta2), 0, newV2 * Math.cos(newTheta2));
        o1.setSpeed(newV1Vector);
        o2.setSpeed(newV2Vector.multiplyScalar(-1));
         /*else {
            const pos1 = o1.getPostion();
            const pos2 = o2.getPostion();
            let delta = pos2.sub(pos1);
            delta = delta.normalize();
            delta.multiplyScalar(30);
            o2.setSpeed(delta);
        }*/
    }
}
