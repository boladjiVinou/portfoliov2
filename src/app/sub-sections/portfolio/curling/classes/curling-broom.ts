import {OBJLoader} from 'three-obj-mtl-loader';
import * as THREE from 'three';
import { CurlingStone } from './curling-stone';
export class CurlingBroom {
    private loader1: OBJLoader = new OBJLoader();
    private broom: THREE.Mesh;
    private follower: EventListener;
    private stoneFollower: any;
    private up = false;
    private cancelCurrentUpdate = false;
    public init(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.loader1.load('../../../../../../assets/curling/curling_broom/broom.obj', (broom: THREE.Mesh) => {
                this.broom = broom;
                this.broom.rotateOnAxis(new THREE.Vector3(-1, 0, 0), 2 * Math.PI / 3);
                this.broom.scale.set(1, 1, 0.5);
                this.broom.visible = false;
                this.broom.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshStandardMaterial({ color: '#607D8B' });
                    }
                });
                resolve();
                return;
            });
        });
    }
    private mouseFollower(event: MouseEvent, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        const vector = new THREE.Vector3();
        const canvasSize = (renderer.context.canvas as Element).getBoundingClientRect();
        vector.set( (( event.clientX  - canvasSize.left ) / (canvasSize.right - canvasSize.left) ) * 2 - 1,
        -(( event.clientY - canvasSize.top ) / (canvasSize.bottom - canvasSize.top) ) * 2 + 1,
         1);
        vector.unproject(camera);
        const distance = vector.y / (vector.y - camera.position.y);
        const posX = vector.x + (camera.position.x - vector.x) * distance;
        const posZ = vector.z + (camera.position.z - vector.z) * distance;
        const posY = 19;
        this.broom.position.set(posX, posY, posZ);
    }
    public activateBroom(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.follower = (event: MouseEvent) => {
            this.mouseFollower(event, camera, renderer);
        };
        this.broom.visible = true;
        window.addEventListener('mousemove', this.follower.bind(this));
        window.addEventListener('click', this.brush.bind(this));
    }
    public simulateBroomMovements(stone: CurlingStone) {
        this.broom.visible = true;
        this.up = false;
        this.stoneFollower = setInterval(() => {
            if (this.cancelCurrentUpdate)
            {
                this.stopBroomSimulation();
                return;
            }
            if (Math.random() > 0.5) {
                this.broom.visible = true;
                const stonePos = stone.getPostion();
                this.broom.position.set(stonePos.x - 80, stonePos.y, stonePos.z);
                this.brush();
            } else {
                this.broom.visible = false;
            }
        }, 150);
    }
    public stopBroomSimulation() {
        this.broom.visible = false;
        clearInterval(this.stoneFollower);
    }
    public desactivateBroom(renderer: THREE.WebGLRenderer) {
        this.broom.visible = false;
        window.removeEventListener('mousemove', this.follower.bind(this));
        window.removeEventListener('click', this.brush.bind(this));
    }
    public getMesh(): THREE.Mesh {
        return this.broom;
    }
    public brush() {
        if (this.up) {
            this.broom.position.z -= 5;
        } else {
            this.broom.position.z += 5;
        }
        this.up = !this.up;
    }
    public setUpdateCancel(value: boolean)
    {
        this.cancelCurrentUpdate = value;
    }
}
