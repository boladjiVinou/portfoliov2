/*
 * @auteur : Equipe 21
 * @date : 03 March 2017
 * @description : Cette classe implemente les differente informations,
 *                ainsi l'ensemble des operations sur la fleche de direction.
 */
import * as THREE from 'three';
import { STONE_INIT_X, STONE_INIT_Y, STONE_INIT_Z } from './Constant';
export class CurlingArrow {
    public arrow: THREE.ArrowHelper;
    private realMouseY = 1;
    private startPos = new THREE.Vector3(STONE_INIT_X - 5, STONE_INIT_Y, STONE_INIT_Z);
    private direction: THREE.Vector3;
    constructor() {
        this.direction = new THREE.Vector3().subVectors(new THREE.Vector3(STONE_INIT_X - 5, STONE_INIT_Y, STONE_INIT_Z) , this.startPos);
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
        if (posX > STONE_INIT_X && this.realMouseY <= 0) {
            const newVertex = new THREE.Vector3(STONE_INIT_X - (Math.abs(STONE_INIT_X - posX)), 0, -posZ );
            this.direction = new THREE.Vector3().subVectors(newVertex, this.startPos);
            this.direction.normalize();
            this.arrow.setDirection(this.direction);
        }
    }

    public simulateArrowUpdate(finalDirection: THREE.Vector3): Promise<void> {
        return new Promise<void>((resolve) => {
            const limit =  40 * Math.random() + 9;
            this.direction = (Math.random() > 0.5 ) ? new THREE.Vector3(-1, 0, 1) : new THREE.Vector3(-1, 0, -1);
            this.arrow.setDirection(this.direction);
            let delta = finalDirection.clone().sub(this.direction);
            delta = delta.divideScalar(limit);
            let counter = 0;
            const updater = setInterval(() => {
            if (counter < limit) {
                ++counter;
                this.direction = this.direction.add(delta);
                this.arrow.setDirection(this.direction);
            } else {
                this.direction = finalDirection;
                this.arrow.setDirection(this.direction);
                resolve();
                clearInterval(updater);
            }
            }, 40);
        });
    }

    getDirection(): THREE.Vector3 {
        return this.direction.clone();
    }
}
