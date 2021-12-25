import * as THREE from 'three';
import { Object3D } from 'three';
export class IRRay {
    private rayCaster = new THREE.Raycaster();
    private ray: THREE.Line;
    private targets: THREE.Object3D[] = [];
    private parent: THREE.Mesh;
    private direction: THREE.Vector3;
    private rayGeo: THREE.BufferGeometry;
    private rayMat: THREE.Material;
    private needInversion = false;
    private lastReadValue = 0;
    private positionBufferAttribute: THREE.BufferAttribute;
    private readonly POSITION = 'position';
    public constructor(parent: THREE.Mesh, rayDirection: THREE.Vector3) {
        this.rayMat = new THREE.LineBasicMaterial({
            color: 0xFF0000
          });
        const scaledDir = rayDirection.clone().multiplyScalar(100);
        const parentPos  = new THREE.Vector3(0, 0 , 0);
        const end = new THREE.Vector3(parentPos.x + scaledDir.x,
          parentPos.y + scaledDir.y,
          parentPos.z + scaledDir.z);
        this.positionBufferAttribute = new THREE.BufferAttribute(new Float32Array( [0, 0 , 0, parentPos.x + scaledDir.x,
            parentPos.y + scaledDir.y,
            parentPos.z + scaledDir.z ]), 3);
        this.rayGeo =  new THREE.BufferGeometry();
        this.rayGeo.setAttribute(this.POSITION, this.positionBufferAttribute);
        this.ray = new THREE.Line(this.rayGeo, this.rayMat );
        this.parent = parent;
        this.direction = rayDirection;
    }

    public animate(): void {
      if (this.targets.length > 0) {
        const parentPos = new THREE.Vector3();
        parentPos.setFromMatrixPosition(this.parent.matrixWorld );
        if (this.needInversion) {
          this.rayCaster.set(parentPos, this.direction.clone().multiplyScalar(-1).normalize());
        } else {
          this.rayCaster.set(parentPos, this.direction.normalize());
        }
        const intersections = this.rayCaster.intersectObject(this.targets[0].children[0]);
        if (intersections.length > 0) {
            const intersection = this.parent.worldToLocal(intersections[0].point);
            this.rayGeo.getAttribute(this.POSITION).setXYZ(1, intersection.x, intersection.y, intersection.z);
            // tslint:disable-next-line:no-string-literal
            this.rayMat['color'].setHex( 0x00FF00);
            this.rayMat.needsUpdate = true;
         } else {
            const scaledDir = this.direction.clone().multiplyScalar(100);
            const nextPos = new THREE.Vector3(this.rayGeo.attributes.position.array[0] + scaledDir.x,
            this.rayGeo.attributes.position.array[1] + scaledDir.y,
            this.rayGeo.attributes.position.array[2] + scaledDir.z);
            this.rayGeo.getAttribute(this.POSITION).setXYZ(1, nextPos.x, nextPos.y, nextPos.z);
            // tslint:disable-next-line:no-string-literal
            this.rayMat['color'].setHex( 0xFF0000);
         }
        this.ray.geometry.attributes.position.needsUpdate = true;
      }
    }
    public setTargets(targets: Object3D[]) {
      this.targets = targets;
    }
    public setNeedToInvertDirection(need: boolean) {
      this.needInversion = need;
    }
    public getLastReadValue(): number {
      return this.lastReadValue;
    }
    public getMesh(): THREE.Line {
        return this.ray;
    }
}
