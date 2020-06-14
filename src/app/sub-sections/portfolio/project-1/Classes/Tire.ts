import * as THREE from 'three';
import { OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import { Object3D } from 'three';
export class Tire {
    private loader1: OBJLoader = new OBJLoader();
    private matLoader: MTLLoader = new MTLLoader();
    private tire: THREE.Object3D;
    public init(): Promise<THREE.Object3D> {
        return new Promise<THREE.Object3D>((resolve) => {
            this.matLoader.setPath('../../../assets/TIRES/');
            this.matLoader.load('../../../assets/TIRES/modelObj.mtl', (tireMaterial: {preload: () => void; }) => {
                tireMaterial.preload();
                this.loader1.setMaterials(tireMaterial as MTLLoader.MaterialCreator);
                this.loader1.load('../../../assets/TIRES/modelObj.obj', (tire: Object3D) => {
                    tire.scale.set(0.04, 0.04, 0.05);
                    this.tire = tire;
                    resolve(this.tire);
                    return;
                });
            });
        });
    }
    public getMesh(): THREE.Mesh {
        return this.tire as THREE.Mesh;
    }
    public clone(): Tire {
        const newTire = new Tire();
        newTire.tire = this.tire.clone();
        return newTire;
    }
    public animate(): void {

    }
}
