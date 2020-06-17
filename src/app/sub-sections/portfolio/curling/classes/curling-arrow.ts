/*
 * @auteur : Equipe 21
 * @date : 03 March 2017
 * @description : Cette classe implemente les differente informations,
 *                ainsi l'ensemble des operations sur la fleche de direction.
 */
import * as THREE from 'three';
const X_INIT_CURLING_STONE = 660;
export class CurlingArrow {
    public arrow: THREE.ArrowHelper;
    private realMouseY = 1;
    private startPos = new THREE.Vector3(665, 19, -14);
    private direction: THREE.Vector3;
    constructor() {
        this.direction = new THREE.Vector3().subVectors(new THREE.Vector3(660, 19, -14) , this.startPos);
        this.direction.normalize();
        this.arrow = new THREE.ArrowHelper(this.direction, this.startPos, 100, 0x00ff00);
        this.arrow.visible = false;
    }

    getArrow(): THREE.ArrowHelper {
        return this.arrow;
    }

    updateArrowDirection(event: MouseEvent, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        const vector = new THREE.Vector3();
        const canvasSize = (renderer.context.canvas as Element).getBoundingClientRect();
        vector.set( (( event.clientX  - canvasSize.left ) / (canvasSize.right - canvasSize.left) ) * 2 - 1,
        -(( event.clientY - canvasSize.top ) / (canvasSize.bottom - canvasSize.top) ) * 2 + 1,
         1);
        vector.unproject(camera);
        this.realMouseY = -(( event.clientY - canvasSize.top ) / (canvasSize.bottom - canvasSize.top) ) * 2 + 1;
        const distance = vector.y / (vector.y - camera.position.y);
        const posX = vector.x + (camera.position.x - vector.x) * distance;
        const posZ = vector.z + (camera.position.z - vector.z) * distance;
        if (posX > X_INIT_CURLING_STONE && this.realMouseY <= 0) {
            const newVertex = new THREE.Vector3(X_INIT_CURLING_STONE - (Math.abs(X_INIT_CURLING_STONE - posX)), 19, -posZ - 25);
            this.direction = new THREE.Vector3().subVectors(newVertex, this.startPos);
            this.direction.normalize();
            this.arrow.setDirection(this.direction);
        }
    }

    public simulateArrowUpdate(finalDirection: THREE.Vector3): Promise<void> {
        return new Promise<void>((resolve) => {
            this.direction = new THREE.Vector3(-1, 0, 0);
            this.arrow.setDirection(this.direction);
            let delta = finalDirection.clone().sub(this.direction);
            delta = delta.divideScalar(10);
            let counter = 0;
            const updater = setInterval(() => {
            if (counter < 9) {
                ++counter;
                this.direction = this.direction.add(delta);
                this.arrow.setDirection(this.direction);
            } else {
                this.direction = finalDirection;
                this.arrow.setDirection(this.direction);
                resolve();
                clearInterval(updater);
            }
            }, 200);
        });
    }

    getDirection(): THREE.Vector3 {
        return this.direction.clone();
    }
}
