import * as THREE from 'three';
export class TapeSensor {
    private tapeSensor: THREE.Mesh;
    public constructor() {
        const tapeSensorGeo = new THREE.BoxGeometry(3, 0.3, 0.3);
        const tapeSensorMat = new THREE.MeshLambertMaterial({color: 0x1B5E20});
        const tapeSensor = new THREE.Mesh(tapeSensorGeo, tapeSensorMat);
        tapeSensor.position.set(0, -0.25, -2.2);
        this.tapeSensor = tapeSensor;
    }
    public getMesh(): THREE.Mesh {
        return this.tapeSensor;
    }
    public animate(): void {

    }
}
