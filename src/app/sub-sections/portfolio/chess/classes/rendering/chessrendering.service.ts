import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Scene, SpotLight, WebGLRenderer } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { AudioPlayer } from '../audio/audioplayer';
import { ChessBoard } from '../board/chessboard';
import { LivingRoom } from '../room/livingroom';
import { ChessInteractor } from '../sceneinteraction/chessinteractor';
@Injectable()
export class ChessRenderingService implements OnDestroy {
    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private container: Element;
    private camreaFrontIdealPosiion = new THREE.Vector3(850, -400, 0);
    private cameraTopIdealPosition = new THREE.Vector3(0, 100, 0);
    private parentNode: THREE.Object3D = new THREE.Object3D();
    private parentNodeInitialPosition: THREE.Vector3;
    private shouldAnimateParentNode = true;
    private parentNodeAnimationDelta = 5;
    private chessInteractor: Readonly<ChessInteractor>;
    private ambientSoundPlayer: AudioPlayer;
    private chessboard: ChessBoard;

    public init(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0c2b40);

            this.initRenderer();
            this.initCamera();
            this.initRoom();

            this.parentNode.translateY(-3000);
            this.parentNodeInitialPosition = this.parentNode.position.clone();
            this.scene.add(this.parentNode);

            this.initLight();
            this.initChessBoard().then(() =>
            {
               this.initAmbientSound().then(() => {
                   resolve();
                   return;
               });
            });

        });
    }

    private initRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, depth: true , logarithmicDepthBuffer: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    private initRoom()
    {
        const room = new LivingRoom();
        room.init();
        room.getChildren().forEach(piece => {
            this.parentNode.add(piece);
        });
    }

    private initCamera()
    {
        this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 50000);
        this.camera.position.set(12898.264904688718, 13000, 14319.672926075744);
        this.camera.lookAt(0, -1000, 0);
        // this.camera.add(new THREE.PointLight(0x404040, 0.3));
        this.scene.add(this.camera);
    }

    private initLight()
    {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        directionalLight.position.set(0, 1, 1);
        // this.scene.add(directionalLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 10000, 0.1);
        pointLight.castShadow = true;
        const pointLightHelper = new THREE.PointLightHelper(pointLight);
        pointLight.position.set(0, 2000, 2000);
        this.scene.add(pointLight);
        const ambientLight = new THREE.AmbientLight( 0xffffff, 1);
        this.scene.add(ambientLight);
    }

    private initChessBoard(): Promise<void>
    {
        this.chessboard = new ChessBoard();
        return this.chessboard.init().then(() => {
            const board = this.chessboard.getBoard();
            board.forEach((chessLine) => {
                chessLine.forEach((chessCase) => {
                    this.parentNode.add(chessCase.getModel());
                });
            });
            this.chessboard.getPieces().forEach(piece =>
                {
                    this.parentNode.add(piece.getModel());
                });
        });
    }

    private initAmbientSound(): Promise<void>
    {
        this.ambientSoundPlayer = new AudioPlayer();
        return this.ambientSoundPlayer.initSound(this.camera, this.scene, '../../../../../assets/chess/Juan-Sanchez-Now-The-Silence.mp3');
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
    public getChessboard(): Readonly<ChessBoard>
    {
        return this.chessboard;
    }
    public getRenderer(): Readonly<THREE.WebGLRenderer>
    {
        return this.renderer;
    }

    public setCameraControl(isEnabled: boolean)
    {
        this.controls.enabled = isEnabled;
    }
    public stopAmbientSound() {
        this.ambientSoundPlayer.setEnable(false);
        this.ambientSoundPlayer.stopSound();
    }
    public playAmbientSound(playWithLoop: boolean) {
        this.ambientSoundPlayer.setEnable(true);
        this.ambientSoundPlayer.playSound(playWithLoop);
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
        if (this.chessInteractor != null)
        {
            this.chessInteractor.removeMouseClickListener();
        }
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
        if (this.chessInteractor != null)
        {
            this.chessInteractor.onResize();
        }
    }

    private resizeListener(event){
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.camera.updateProjectionMatrix();
        if (this.chessInteractor != null)
        {
            this.chessInteractor.onResize();
        }
    }

    public getScene(): THREE.Scene
    {
        return this.scene;
    }

    public getCamera(): THREE.Camera
    {
        return this.camera;
    }

    public setChessInteractor(interactor: Readonly<ChessInteractor>)
    {
        this.chessInteractor = interactor;
    }

    public animate() {
        this.animateParentNode();
        this.renderer.render(this.scene, this.camera);
        if (this.chessInteractor != null)
        {
            this.chessInteractor.animate();
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}
