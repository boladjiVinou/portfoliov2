import * as THREE from 'three';
import { IRRay } from './IRRay';
export class IrSensor {
    private irSensor: THREE.Mesh;
    private myRay: IRRay;
    public constructor() {
        const frontTireBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
        const frontTireBaseMat = new THREE.MeshLambertMaterial({color: 0x616161});
        this.irSensor = new THREE.Mesh(frontTireBaseGeo, frontTireBaseMat);
    }
    public getMesh(): THREE.Mesh {
        return this.irSensor;
    }
    public setRay(ray: IRRay): void {
        this.myRay = ray;
        this.irSensor.add(this.myRay.getMesh());
    }
    public getRay(): IRRay {
        return this.myRay;
    }
    public animate(): void {
        if (this.myRay !== undefined) {
            this.myRay.animate();
        } else {
            console.log('ray undefined');
        }
    }
}
