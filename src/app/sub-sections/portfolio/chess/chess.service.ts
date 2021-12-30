import { Injectable, OnDestroy } from '@angular/core';
import { copyFileSync } from 'fs';
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
    private pointLight: THREE.PointLight = new THREE.PointLight( 0xffffff, 1, 150);
    private pointLightHelper: THREE.Mesh;
    private angle = 0;

    public init(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0c2b40
                );
            this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, logarithmicDepthBuffer: true});
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 50000);
            this.camera.position.set(1600, 800, 5);
            const axisHelper = new THREE.AxesHelper(10);
            this.scene.add(axisHelper);
            this.scene.add(this.camera);
            const chessBoard = new ChessBoard();
            const board = chessBoard.getBoard();
            board.forEach((chessLine) => {
                chessLine.forEach((chessCase) => {
                    this.scene.add(chessCase);
                });
            });
            const ambientLight = new THREE.AmbientLight( 0xffffff, 1);
            this.pointLightHelper = new THREE.Mesh(new THREE.SphereGeometry(3), new THREE.MeshBasicMaterial({color: this.pointLight.color}));
            const room = new LivingRoom();
            room.init();
            room.getChildren().forEach(piece => {
                this.scene.add(piece);
            });
            const spotLight = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 2, 0.1);
            spotLight.position.set(0, 2000, 0);
            this.scene.add(spotLight);
            this.scene.add(ambientLight);
            const light = new THREE.PointLight(0xffffff, 0.3);
            light.castShadow = true;
            this.camera.add(light);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.initController();
            resolve();
            return;
        });
    }

    private movePointLight()
    {
        this.pointLightHelper.position.set(500 * Math.cos(this.angle), 50 * Math.cos(this.angle), 500 * Math.sin(this.angle));
        this.pointLight.position.set( this.pointLightHelper.position.x,  this.pointLightHelper.position.y,  this.pointLightHelper.position.z);
        this.angle += 0.003;
        if (this.angle > 6.28) {
            this.angle %= 6.28;
        }
    }

    private slowlyCreateGrid(board: ChessCase[][])
    {
        let i = 0;
        let j = 0;
        const caseAdder = () => {
                if (i < 8)
                {
                    if (j === 8)
                    {
                        ++i;
                        j = 0;
                    }
                    this.scene.add(board[i][j]);
                    ++j;
                }
            };
        setInterval(() => {
                if (i < 8)
                {
                    caseAdder();
                    console.log('adding');
                }
            }, 1000);
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
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        // this.movePointLight();
        requestAnimationFrame(this.animate.bind(this));
    }
}
