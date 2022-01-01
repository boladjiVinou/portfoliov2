import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Color, Scene, SpotLightHelper, WebGLRenderer } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { ChessBoard } from './classes/chessboard';
import { ChessCase } from './classes/chessCase';
import { LivingRoom } from './classes/livingroom';
@Injectable()
export class ChessService implements OnDestroy {
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private container: Element;
    private camreaIdealPosiion = new THREE.Vector3(722.2176644540187, 1460.165275547255, -16.547152691981342); // start x: 12898.264904688718, y: 11203.707713608126, z: 14319.672926075744
    private parentNode: THREE.Object3D;
    private parentNodeInitialPosition: THREE.Vector3;
    private shouldAnimateParentNode = true;
    private parentNodeAnimationDelta = 5;

    public init(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0c2b40);
            this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, depth: true , logarithmicDepthBuffer: true});
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 50000);
            this.camera.position.set(12898.264904688718, 13000, 14319.672926075744);

            const axisHelper = new THREE.AxesHelper(10);
            // this.scene.add(axisHelper);
            this.scene.add(this.camera);

            this.parentNode = new THREE.Object3D();
            const chessBoard = new ChessBoard();
            const board = chessBoard.getBoard();
            board.forEach((chessLine) => {
                chessLine.forEach((chessCase) => {
                    this.parentNode.add(chessCase);
                });
            });
            const ambientLight = new THREE.AmbientLight( 0xffffff, 1);
            const room = new LivingRoom();
            room.init();
            room.getChildren().forEach(piece => {
                this.parentNode.add(piece);
            });
            this.parentNode.translateY(-3000);
            this.parentNodeInitialPosition = this.parentNode.position.clone();
            this.scene.add(this.parentNode);

            const spotLight = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 2, 0.1);
            spotLight.position.set(0, 3000, 0);
            this.scene.add(spotLight);
            this.scene.add(ambientLight);
            this.camera.add(new THREE.PointLight(0xffffff, 0.4));
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.initController();
            resolve();
            return;
        });
    }

    private animateParentNode()
    {
        if (this.shouldAnimateParentNode)
        {
            if (this.parentNode.position.y > this.parentNodeInitialPosition.y + 200 || this.parentNode.position.y < this.parentNodeInitialPosition.y)
            {
                this.parentNodeAnimationDelta *= -1;
            }
            this.parentNode.position.y += this.parentNodeAnimationDelta;
        }
    }

    public moveCameraToIdealPosition(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            const cameraPositionUpdater = setInterval(() => {
                const increment = 6;
                if (this.camera.position.x < this.camreaIdealPosiion.x) {
                    this.camera.position.x += increment;
                }
                else if (this.camera.position.x > this.camreaIdealPosiion.x && (this.camera.position.x - this.camreaIdealPosiion.x >= increment))
                {
                this.camera.position.x -= increment;
                }
                if (this.camera.position.z < this.camreaIdealPosiion.z && this.camera.position.z < 0) {
                    this.camera.position.z += increment;
                } else if (this.camera.position.z < this.camreaIdealPosiion.z && this.camera.position.z > 0) {
                    this.camera.position.z -= increment;
                }
                if (this.camera.position.z > this.camreaIdealPosiion.z)
                {
                    this.camera.position.z -= increment;
                }
                if (this.camera.position.y < this.camreaIdealPosiion.y)
                {
                    this.camera.position.y += increment;
                } else if (this.camera.position.y > this.camreaIdealPosiion.y && (this.camera.position.y - this.camreaIdealPosiion.y >= increment)) {
                    this.camera.position.y -= increment;
                }
                const magn = new THREE.Vector3().subVectors(this.camera.position, this.camreaIdealPosiion);
                if (magn.length() < 10)
                {
                    this.camera.position.set(this.camreaIdealPosiion.x, this.camreaIdealPosiion.y, this.camreaIdealPosiion.z);
                    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                    clearInterval(cameraPositionUpdater);
                    resolve();
                    return;
                }
            }, 30);
        });
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animate.bind(this));
        const materialCleaner = (material: any) => {
            for (const key of Object.keys(material)) {
                const value = material[key];
                if (value && typeof value === 'object' && 'minFilter' in value) {
                    value.dispose();
                }
            }
        };
        this.scene.traverse((object: THREE.Mesh) => {
            if (object.isMesh){
                object.geometry.dispose();
                if (!object.material){
                    return;
                }
                if (!Array.isArray(object.material)) {
                    materialCleaner(object.material);
                } else {
                    for (const material of object.material as THREE.Material[]) {
                        materialCleaner(material);
                    }
                }
            }
        });
        window.removeEventListener('resize', this.resizeListener.bind(this));
        this.scene.children = [];
        this.renderer.dispose();
    }

    private initController() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
    }

    public setupHtmlContainer(container: Element)
    {
        this.renderer.domElement.id = 'renderBody';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.container = container;
        this.container.appendChild(this.renderer.domElement);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        window.addEventListener('resize', this.resizeListener.bind(this));
    }

    private resizeListener(event){
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    public animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.animateParentNode();
        this.renderer.render(this.scene, this.camera);
    }
}
