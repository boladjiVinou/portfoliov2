import { PhysicObject } from './physic-object';
import * as THREE from 'three';
// use this to reimplement your physic: 
//  https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331
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
        this.objects.filter((x: PhysicObject) => {
            return x.isVisible();
        }).forEach((value: PhysicObject) => {
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
        console.log('handling collision');
        // balls have same weight therefor to handle the collision we should just exchange the speeds
        // but to make it a little bit realistic I will slow down them a little bit
        const slowingFactor = 0.69;
        const tmpU1 = o1.getSpeed().multiplyScalar(slowingFactor);
        o1.setSpeed(o2.getSpeed().multiplyScalar(slowingFactor));
        o2.setSpeed(tmpU1);
    }
}
