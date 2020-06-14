import * as THREE from 'three';
import { Object3D } from 'three';
export class IRRay {
    private rayCaster = new THREE.Raycaster();
    private ray: THREE.Line;
    private targets: THREE.Object3D[] = [];
    private parent: THREE.Mesh;
    private direction: THREE.Vector3;
    private rayGeo: THREE.Geometry;
    private rayMat: THREE.Material;
    private needInversion = false;
    private lastReadValue = 0;
    public constructor(parent: THREE.Mesh, rayDirection: THREE.Vector3) {
        this.rayMat = new THREE.LineBasicMaterial({
            color: 0xFF0000
          });
        this.rayGeo = new THREE.Geometry();
        const scaledDir = rayDirection.clone().multiplyScalar(100);
        // const vector = new THREE.Vector3();
        // vector.setFromMatrixPosition( parent.matrixWorld );
        // const parentPos = vector; // parent.getWorldPosition(parent.position);
        const parentPos  = new THREE.Vector3(0, 0 , 0);
        const end = new THREE.Vector3(parentPos.x + scaledDir.x,
          parentPos.y + scaledDir.y,
          parentPos.z + scaledDir.z);
        this.rayGeo.vertices.push(parentPos, end);
        this.ray = new THREE.Line( this.rayGeo, this.rayMat );
        this.parent = parent;
        this.direction = rayDirection;
    }

    public animate(): void {
      if (this.targets.length > 0) {
        const parentPos = new THREE.Vector3();
        parentPos.setFromMatrixPosition(this.parent.matrixWorld );
        // (this.ray.geometry as THREE.Geometry).vertices[0] = parentPos;
        if (this.needInversion) {
          this.rayCaster.set(parentPos, this.direction.clone().multiplyScalar(-1).normalize());
        } else {
          this.rayCaster.set(parentPos, this.direction.normalize());
        }
        const intersections = this.rayCaster.intersectObject(this.targets[0].children[0]);
        if (intersections.length > 0) {
             (this.ray.geometry as THREE.Geometry).vertices[1] = this.parent.worldToLocal(intersections[0].point);
             // tslint:disable-next-line:no-string-literal
             this.rayMat['color'].setHex( 0x00FF00);
             this.rayMat.needsUpdate = true;
         } else {
          const scaledDir = this.direction.clone().multiplyScalar(100);
          (this.ray.geometry as THREE.Geometry).vertices[1] = new THREE.Vector3(this.rayGeo.vertices[0].x + scaledDir.x,
            this.rayGeo.vertices[0].y + scaledDir.y,
            this.rayGeo.vertices[0].z + scaledDir.z);
          // tslint:disable-next-line:no-string-literal
          this.rayMat['color'].setHex( 0xFF0000);
         }
        this.rayGeo.verticesNeedUpdate = true;
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
