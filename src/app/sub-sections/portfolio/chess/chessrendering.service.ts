import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Color, Scene, SpotLightHelper, WebGLRenderer } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { ChessBoard } from './classes/chessboard';
import { LivingRoom } from './classes/livingroom';
@Injectable()
export class ChessRenderingService implements OnDestroy {
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private container: Element;
    private camreaFrontIdealPosiion = new THREE.Vector3(850, -400, 0);
    private cameraTopIdealPosition = new THREE.Vector3(0, 0, 0);
    private parentNode: THREE.Object3D;
    private parentNodeInitialPosition: THREE.Vector3;
    private shouldAnimateParentNode = true;
    private parentNodeAnimationDelta = 5;
    private ambientSound: THREE.Audio;

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
            chessBoard.init().then(() => {
                const board = chessBoard.getBoard();
                board.forEach((chessLine) => {
                    chessLine.forEach((chessCase) => {
                        this.parentNode.add(chessCase);
                    });
                });
                chessBoard.getPieces().forEach(piece =>
                    {
                        this.parentNode.add(piece.getModel());
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
                this.camera.add(new THREE.PointLight(0xffffff, 0.3));
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.camera.lookAt(0, -1000, 0);
                // this.initController();
                this.initSound().then(() => {
                    resolve();
                    return;
                });
            });
        });
    }

    private animateParentNode()
    {
        console.log(`ha`);
        if (this.shouldAnimateParentNode)
        {
            console.log('he');
            if (this.parentNode.position.y > this.parentNodeInitialPosition.y + 200 || this.parentNode.position.y < this.parentNodeInitialPosition.y)
            {
                this.parentNodeAnimationDelta *= -1;
            }
            this.parentNode.position.y += this.parentNodeAnimationDelta;
        }
    }
    public setCameraControl(isEnabled: boolean)
    {
        this.controls.enabled = isEnabled;
    }

    private initSound(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            // instantiate a listener
            const audioListener = new THREE.AudioListener();
            // add the listener to the camera
            this.camera.add( audioListener );
            // instantiate audio object
            this.ambientSound = new THREE.Audio( audioListener );
            // add the audio object to the scene
            this.scene.add( this.ambientSound  );
            // instantiate a loader
            const loader = new THREE.AudioLoader();
            // load a resource
            loader.load(
                // resource URL
                '../../../../../assets/chess/Juan-Sanchez-Now-The-Silence.mp3',
                // onLoad callback
                ( audioBuffer ) => {
                    this.ambientSound.setBuffer(audioBuffer);
                    this.ambientSound.setLoop(true);
                    resolve();
                    return;
                },
                // onProgress callback
                ( xhr ) => {
                    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },
                // onError callback
                ( err: any )  => {
                    console.log( err);
                }
            );
        });
    }
    public stopSound() {
        if (this.ambientSound !== undefined && this.ambientSound.isPlaying) {
            this.ambientSound.stop();
        }
    }
    public playSound() {
        if (this.ambientSound !== undefined) {
            this.ambientSound.play();
            this.ambientSound.setLoop(true);
        }
    }

    public moveCameraToIdealPosition(viewFromTop: boolean): Promise<void>
    {
        this.shouldAnimateParentNode = false;
        return new Promise<void>((resolve) => {
            const cameraPositionUpdater = setInterval(() => {
                const increment = 6;
                if (this.camera.position.x < this.camreaFrontIdealPosiion.x) {
                    this.camera.position.x += increment;
                }
                else if (this.camera.position.x > this.camreaFrontIdealPosiion.x && (this.camera.position.x - this.camreaFrontIdealPosiion.x >= increment))
                {
                this.camera.position.x -= increment;
                }
                if (this.camera.position.z < this.camreaFrontIdealPosiion.z && this.camera.position.z < 0) {
                    this.camera.position.z += increment;
                } else if (this.camera.position.z < this.camreaFrontIdealPosiion.z && this.camera.position.z > 0) {
                    this.camera.position.z -= increment;
                }
                if (this.camera.position.z > this.camreaFrontIdealPosiion.z)
                {
                    this.camera.position.z -= increment;
                }
                if (this.camera.position.y < this.camreaFrontIdealPosiion.y)
                {
                    this.camera.position.y += increment;
                } else if (this.camera.position.y > this.camreaFrontIdealPosiion.y && (this.camera.position.y - this.camreaFrontIdealPosiion.y >= increment)) {
                    this.camera.position.y -= increment;
                }
                const magn = new THREE.Vector3().subVectors(this.camera.position, this.camreaFrontIdealPosiion);
                if (magn.length() < 4500)
                {
                    if (viewFromTop)
                    {
                        this.camera.position.set(this.cameraTopIdealPosition.x, this.cameraTopIdealPosition.y, this.cameraTopIdealPosition.z);
                        this.camera.lookAt(-150, -3000, 0);
                    }
                    else
                    {
                        this.camera.position.set(this.camreaFrontIdealPosiion.x, this.camreaFrontIdealPosiion.y, this.camreaFrontIdealPosiion.z);
                        this.camera.lookAt(-1500, -3000, 0);
                    }
                    this.camera.updateProjectionMatrix();
                    this.renderer.setPixelRatio(window.devicePixelRatio);
                    clearInterval(cameraPositionUpdater);
                    resolve();
                    return;
                }
            }, 15);
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
        // this.controls.update();
        this.animateParentNode();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }
}
