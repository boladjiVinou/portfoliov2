import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Scene, WebGLRenderer, Color, Object3D, Audio, HemisphereLight } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';
import { isArray } from 'util';

@Injectable()
export class CurlingService implements OnDestroy {
    private scene: Scene;
    private camera: THREE.PerspectiveCamera;
    public renderer: WebGLRenderer;
    public light: THREE.HemisphereLight;
    private controls: any;
    private loader1: OBJLoader = new OBJLoader();
    private matLoader: MTLLoader = new MTLLoader();
    private world: THREE.Object3D;
    private skybox: THREE.Mesh;
    private startRotatingSkybox = false;
    private rotationIntervalMethod: any;
    private cameraStartPosition: THREE.Vector3 = new THREE.Vector3(1000, 200, 0);
    private cameraAngle = Math.PI / 2;
    private ambientSound: THREE.Audio;
    private elevationDir = 1;
    // tslint:disable-next-line:ban-types
    public stoneFollower: Function = null;
    // tslint:disable-next-line:ban-types
    public worldUpdater: Function;
    /**
     * Cette methode cree la scene, la skybox, initialise certains attributs
     */
    public  init(): Promise<void> {
        return new Promise<void>((resolve) => {
            console.log(' service initializing');
            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            // https://dustinpfister.github.io/2018/04/07/threejs-camera-perspective/
            this.camera = new THREE.PerspectiveCamera(45, 16 / 9 , 0.1, 10000);
            this.camera.position.set(1600, 800, 5);
            const axesHelper = new THREE.AxesHelper(10);
            this.scene.add( axesHelper );
            this.scene.add(this.camera);
            this.renderer.setClearColor(new Color(51, 63, 71), 1);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
            this.scene.add(this.light);
            this.setController();
            this.createSkybox();
            this.camera.position.set(this.cameraStartPosition.x, this.cameraStartPosition.y, this.cameraStartPosition.z );
            this.controls.enabled = false;
            this.rotateCamera();
            this.loadCurlingWorld().then(() => {
                resolve();
                return;
            });
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
                if (!isArray(object.material)) {
                    materialCleaner(object.material);
                } else {
                    for (const material of object.material as THREE.Material[]) {
                        materialCleaner(material);
                    }
                }
            }
        });
        this.scene.children = [];
        this.scene.dispose();
        this.renderer.dispose();
        console.log(' service destroyed');
    }
    public stop() {
        this.stopSound();
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
    public initAudio(): Promise<void> {
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
                '../../../assets/audio/sugiwa_remember_me.mp3',
                // onLoad callback
                ( audioBuffer ) => {
                    this.ambientSound.setBuffer(audioBuffer);
                    // this.ambientSound.play();
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
    private rotateCamera() {
        this.rotationIntervalMethod = setInterval(() => {
            this.camera.position.x = 1400 * Math.cos( this.cameraAngle - (Math.PI / 750));
            this.camera.position.z = 1400 * Math.sin( this.cameraAngle - (Math.PI / 750));
            this.cameraAngle -= (Math.PI / 750);
        }, 30);
    }
    private slowlyMoveToStartPosition(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.rotationIntervalMethod = setInterval(() => {
                if (this.camera.position.x < this.cameraStartPosition.x) {
                     this.camera.position.x += 3;
                // tslint:disable-next-line:max-line-length
                } else if (this.camera.position.x > this.cameraStartPosition.x && (this.camera.position.x - this.cameraStartPosition.x >= 3)) {
                    this.camera.position.x -= 3;
                }
                if (this.camera.position.z < this.cameraStartPosition.z && this.camera.position.z < 0) {
                     this.camera.position.z += 3;
                } else if (this.camera.position.z < this.cameraStartPosition.z && this.camera.position.z > 0) {
                     this.camera.position.z -= 3;
                }
                if (this.camera.position.z > this.cameraStartPosition.z) {
                     this.camera.position.z -= 3;
                }
                if (this.camera.position.y < this.cameraStartPosition.y) {
                     this.camera.position.y += 3;
                // tslint:disable-next-line:max-line-length
                } else if (this.camera.position.y > this.cameraStartPosition.y && (this.camera.position.y - this.cameraStartPosition.y >= 3)) {
                     this.camera.position.y -= 3;
                }
                const magn = new THREE.Vector3().subVectors(this.camera.position, this.cameraStartPosition);
                if (magn.length() < 10) {
                     // this.controls.enabled = true;
                     this.camera.position.set(this.cameraStartPosition.x, this.cameraStartPosition.y, this.cameraStartPosition.z);
                     resolve();
                     clearInterval(this.rotationIntervalMethod);
                     return;
                }
             }, 30);
        });
    }
    public moveCameraToStartLocation(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this.rotationIntervalMethod);
            this.slowlyMoveToStartPosition().then(() => {
                resolve();
                return;
            });
        });
    }
    public removeCurlingStartView() {
        clearInterval(this.rotationIntervalMethod);
    }
    private loadCurlingWorld(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.createCurlingRunway().then((value: THREE.Object3D) => {
                value.scale.set(28, 28, 28);
                value.rotateX(Math.PI / 2);
                value.translateY(-12);
                this.scene.add(value);
                resolve();
                return;
            });
        });
    }
    /**
     * Cette methode permet de configurer le controlleur de la scene, wasd pour se diriger en 2d
     */
    private setController() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        this.controls.enableZoom = true;
        // this.controls.enablePan = true;
        this.controls.keys = {
            LEFT: 65, // left arrow
            UP: 87, // up arrow
            RIGHT: 68, // right arrow
            BOTTOM: 83, // down arrow
        };
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }
    private createCurlingRunway(): Promise<THREE.Object3D> {
        return new Promise<THREE.Object3D>((resolve) => {
            this.matLoader.setPath('../../../assets/curling/curling_rink/');
            this.matLoader.load('piste2.mtl', (materials: { preload: () => void; }) => {
            materials.preload();
            this.loader1.setMaterials(materials);
            this.loader1.load('../../../assets/curling/curling_rink/piste2.obj', (rink: Object3D) => {
                resolve(rink);
                return;
            });
          }, null , (error: Error) => {
            console.log(error);
          });
        });
    }
    /**
     * Cette methode permet d' initialiser la skybox
     */
    private createSkybox(): void {
        const materials = [];
        const t = [];
        const loader = new THREE.TextureLoader();
        for ( let i = 0; i < 6; i ++ ) {
            t[i] = loader.load('../../../assets/curling/skybox/polyverse.png');
            t[i].repeat.x  = 1 / 6;
            t[i].offset.x = i / 6;
            t[i].minFilter = THREE.NearestFilter;
            t[i].generateMipmaps = true;
            materials.push( new THREE.MeshBasicMaterial( { map: t[i] , side: THREE.BackSide } ) );
        }
        this.skybox = new THREE.Mesh( new THREE.BoxGeometry( 8000, 8000, 8000), materials );
        this.skybox.position.set(0, -1000, 0);
        this.skybox.name = 'skybox';
        this.scene.add( this.skybox );
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }
    public getControls(): any {
        return this.controls;
    }
    public setSkyboxRotation(rot: boolean) {
        this.startRotatingSkybox = rot;
    }
    private rotateSkybox() {
        if (this.skybox && this.startRotatingSkybox) {
            this.skybox.rotateY(Math.PI / 8000);
        }
    }
    /**
     * Cette methode effectue l 'animation
     */
    public animate() {
        this.controls.update();
        if (this.worldUpdater) {
            this.worldUpdater();
        }
        if (this.stoneFollower) {
            this.stoneFollower();
        }
        this.renderer.render(this.scene, this.camera);
        this.rotateSkybox();
        requestAnimationFrame(this.animate.bind(this));
    }
}
