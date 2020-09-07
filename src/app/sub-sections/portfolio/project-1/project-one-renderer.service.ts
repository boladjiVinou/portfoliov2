import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Scene, WebGLRenderer, Color, Object3D } from 'three';
// const OrbitControls = require('three-orbitcontrols');
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {Bot} from './Classes/Bot';
import { IRRay } from './Classes/IRRay';
import { isArray } from 'util';
@Injectable()
export class ProjectOneRendererService implements OnDestroy {

// Donnees de base necessaires au visualiseur
private scene: Scene;
private camera: THREE.PerspectiveCamera;
public renderer: WebGLRenderer;
private light: THREE.PointLight;
private controls: any;
private loader1: OBJLoader = new OBJLoader();
private matLoader: MTLLoader = new MTLLoader();
private skybox: THREE.Mesh;
private table: THREE.Object3D;
private mouse = new THREE.Vector3();
private raycaster = new THREE.Raycaster();
private blackLine: THREE.Mesh;
private myBot: Bot;
private mouseDown = false;
private startMovingSlowlyCamera = false;
private startCameraMachine = false;
private startButton: HTMLElement;
private tableWall1: THREE.Object3D;
private tableWall2: THREE.Object3D;
private cameraAngle = Math.PI / 2;
private cameraStartPosition: THREE.Vector3;
private cameraRotation: THREE.Euler;
private boutonText = 'Recommencer la simulation';
/**
 * Cette methode cree la scene, la skybox, initialise certains attributs
 */
public  init(): Promise<void> {
    console.log('init renderer');
    return new Promise<void>((resolve) => {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        // https://dustinpfister.github.io/2018/04/07/threejs-camera-perspective/
        this.camera = new THREE.PerspectiveCamera(45, 16 / 9 , 0.1, 701);
        this.camera.position.set(5, 240, 700);
        const axesHelper = new THREE.AxesHelper(10);
        this.scene.add( axesHelper );
        this.scene.add(this.camera);
        this.renderer.setClearColor(new Color(51, 63, 71), 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.light = new THREE.PointLight(0xffffff, 1);
        this.light.position.set(0, 700, 0);
        this.scene.add(this.light);
        this.setController();
        console.log('start loading');
        this.loadTable().then(() => {
          this.loadWalls().then(() => {
            this.myBot = new Bot();
            this.myBot.buildBot().then(() => {
              this.scene.add(this.myBot.getMesh());
              this.scene.updateMatrixWorld();
              this.myBot.setPhase1Target([this.tableWall1]);
              this.myBot.setPhase2Target([this.tableWall2]);
              this.myBot.getIrSensor().setRay(new IRRay(this.myBot.getIrSensor().getMesh(), new THREE.Vector3(1, 0, 0)));
              this.scene.updateMatrixWorld();
              this.startMovingSlowlyCamera = true;
              this.startCameraMachine = true;
              this.cameraAngle = Math.PI / 2;
              resolve();
              return;
            });
          });
        });
        this.scene.background = new THREE.Color(0xBCAAA4);
    });
}
/**
 * Cette methode permet de configurer le controlleur de la scene, wasd pour se diriger en 2d
 */
public setController() {
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

private loadWalls(): Promise<void> {
  return new Promise<void>((resolve) => {
    this.loader1.load('../../assets/walls/newWall/newWall/wall1.obj', (wall1: Object3D) => {
      wall1.traverse((child: THREE.Mesh) => {
        child.material = new THREE.MeshLambertMaterial({color: new THREE.Color(0x78909C/*D84315*/)});
      });
      wall1.rotateX(-Math.PI / 2);
      wall1.position.setY(30);
      wall1.scale.set(1, 2, 1);
      wall1.position.setX(-10);
      wall1.position.setZ(68);
      this.scene.add(wall1);
      this.tableWall1 = wall1;
      this.loader1.load('../../assets/walls/newWall/newWall2/Wall2.obj', (wall2: Object3D) => {
        wall2.traverse((child: THREE.Mesh) => {
          child.material = new THREE.MeshLambertMaterial({color: new THREE.Color(0x78909C/*D84315*/)});
        });
        wall2.rotateX(-Math.PI / 2);
        wall2.rotateZ(Math.PI);
        wall2.position.setY(30);
        wall2.scale.set(1, 2, 1);
        wall2.position.setX(-13);
        wall2.position.setZ(-58);
        this.scene.add(wall2);
        this.tableWall2 = wall2;
        resolve();
        return;
      });
    });
  });
}
private loadTable(): Promise<void> {
  return new Promise<void>((resolve) => {
    this.loader1.load('../../assets/table/table.obj', (object: Object3D) => {
      object.visible = true;
      object.position.setX(0);
      object.position.setY(0);
      object.position.setZ(16.1);
      object.traverse((obj: THREE.Mesh) => {
        if (obj.name === 'Box001') {
          obj.material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xdddddd)});
        } else {
          obj.material = new THREE.MeshLambertMaterial({color: new THREE.Color(0x8D6E63)});
        }
      });
      this.scene.add(object);
      this.table = object;
      // tslint:disable-next-line:max-line-length
      this.blackLine = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 121), new THREE.MeshLambertMaterial({color: new THREE.Color(0x000000)}));
      this.blackLine.position.set(0, 35, 0);
      // tslint:disable-next-line:max-line-length
      const startLine = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 1), new THREE.MeshLambertMaterial({color: new THREE.Color(0x000000)}));
      startLine.position.set(0, 35, 50);
      const endLine = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 1), new THREE.MeshLambertMaterial({color: new THREE.Color(0x000000)}));
      endLine.position.set(0, 35, -50);
      this.scene.add(startLine);
      this.scene.add(endLine);
      this.scene.add(this.blackLine);
      const material = new THREE.LineBasicMaterial({
        color: 0xFFA000
      });
      const geometry1 = new THREE.Geometry();
      geometry1.vertices.push(
        new THREE.Vector3( 5.37, 35.3, 50),
        new THREE.Vector3( 5.37, 35.3, -50 )
      );
      const line1 = new THREE.Line( geometry1, material );
      const geometry2 = new THREE.Geometry();
      geometry2.vertices.push(
        new THREE.Vector3( -5.37, 35.3, 50),
        new THREE.Vector3( -5.37, 35.3, -50 )
      );
      const line2 = new THREE.Line( geometry2, material );
      this.scene.add( line1 );
      this.scene.add( line2 );
      resolve();
      return;
    });
  });
}

private updateRenderState() {
  if (this.startCameraMachine) {
    if (this.startMovingSlowlyCamera) {
      this.controls.enabled = false;
      this.camera.position.x = 0;
      if (this.camera.position.y > 70) {
        this.camera.position.y = this.camera.position.y - 1.5;
      }
      if (this.camera.position.z > 90) {
        this.camera.position.z = this.camera.position.z - 1.5;
      }
      if ( this.camera.position.y <= 70 && this.camera.position.z <= 90) {
        this.cameraStartPosition = this.camera.position.clone();
        this.cameraRotation = this.camera.rotation.clone();
        this.startMovingSlowlyCamera = false;
        this.myBot.setCanMove(true);
      }
    } else {
      if (this.myBot.isAbleToMove() && this.myBot.isInPhase1()) {
        if (this.cameraAngle - (Math.PI / 750) >= -Math.PI / 2) {
          this.camera.position.x = 80 * Math.cos( this.cameraAngle - (Math.PI / 750));
          this.camera.position.z = 80 * Math.sin( this.cameraAngle - (Math.PI / 750));
          this.cameraAngle -= (Math.PI / 750);
          this.controls.enabled = false;
        }
      } else if (this.myBot.isAbleToMove() && this.myBot.isInPhase2()) {
        if (this.cameraAngle - (Math.PI / 750) >= -3 * Math.PI / 2) {
          this.camera.position.x = 80 * Math.cos( this.cameraAngle - (Math.PI / 750));
          this.camera.position.z = 80 * Math.sin( this.cameraAngle - (Math.PI / 750));
          this.cameraAngle -= (Math.PI / 750);
          this.controls.enabled = false;
        }
      } else {
        this.controls.enabled = true;
      }
    }
  }
}
public resetRender() {
  if (this.cameraRotation !== undefined && this.cameraStartPosition !== undefined) {
    this.camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z);
    this.camera.position.set(this.cameraStartPosition.x, this.cameraStartPosition.y, this.cameraStartPosition.z + 200);
    this.cameraAngle = Math.PI / 2;
    if (this.myBot !== undefined) {
      this.myBot.resetBot();
    }
    this.startMovingSlowlyCamera = true;
  }
}
/**
 * Cette methode effectue l 'animation
 */
public animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateRenderState();
    if (this.myBot !== undefined) {
      this.myBot.animate();
    }
    requestAnimationFrame(this.animate.bind(this));
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
  console.log('project 1 service destroyed');
}
}
