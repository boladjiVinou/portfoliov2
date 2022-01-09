import * as THREE from 'three';
import { ChessPiece } from '../pieces/chesspiece';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ChessCase } from '../board/chessCase';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
export class ChessInteractor
{
    private outlinables: THREE.Object3D[];
    private outlinablesMap: Map<string, IOutlinable>;
    private previousOutlinableFound: IOutlinable = null;
    private selectablesMap: Map<THREE.Object3D, ISelectable>;
    private selectables: Readonly<ISelectable[]>;
    private renderer: THREE.WebGLRenderer;
    private postEffectComposer: EffectComposer;
    private mousePosition: THREE.Vector2 = new THREE.Vector2();
    private raycaster: THREE.Raycaster;
    private camera: THREE.Camera;
    private outlinePass: OutlinePass;
    private isSelectingSomething = false;
    constructor(outlinables: Readonly<IOutlinable[]>, selectables: Readonly<ISelectable[]>, renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera)
    {
        this.outlinables = outlinables.map(piece => piece.getModel());
        this.outlinablesMap = new Map(outlinables.map(obj => [obj.getModel().uuid, obj]));
        console.log(this.outlinablesMap);
        this.selectablesMap = new Map(selectables.map(obj => [obj.getModel(), obj]));
        this.selectables = selectables;
        this.renderer = renderer;
        this.postEffectComposer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(scene, camera);
        this.postEffectComposer.addPass(renderPass);
        this.outlinePass = new OutlinePass(new THREE.Vector2(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight), scene, camera);
        this.outlinePass.edgeStrength = 8;
        this.outlinePass.visibleEdgeColor.set(0x00ff00);
        this.outlinePass.hiddenEdgeColor.set(0x000000);
        this.postEffectComposer.addPass(this.outlinePass);
        this.raycaster = new THREE.Raycaster();
        this.camera = camera;

    }
    public onResize()
    {
        this.postEffectComposer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight);
    }
    private onMouseClick(event: MouseEvent)
    {
        this.searchPointedObject();
    }
    private onMouseMove(event: MouseEvent)
    {
        this.mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    private searchPointedObject()
    {
        if (!this.isSelectingSomething)
        {
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            let intersectedObjects = this.raycaster.intersectObjects(this.outlinables, true);
            if (intersectedObjects.length > 0)
            {
                if (this.previousOutlinableFound != null)
                {
                    this.previousOutlinableFound.onDeselect();
                    this.previousOutlinableFound = null;
                }
                this.outlinePass.selectedObjects = [intersectedObjects[0].object];
                let node = intersectedObjects[0].object;
                while (!this.outlinablesMap.has(node.uuid))
                {
                    node = node.parent;
                }
                this.outlinablesMap.get(node.uuid).onOutline();
                this.previousOutlinableFound = this.outlinablesMap.get(intersectedObjects[0].object.uuid);
            }
            else if (this.previousOutlinableFound != null)
            {
                intersectedObjects = this.raycaster.intersectObjects(this.selectables.filter(selectable => selectable.isAvailable()).map(selectable => selectable.getModel()), true);
                if (intersectedObjects.length > 0)
                {
                    this.isSelectingSomething = true;
                    this.selectablesMap.get(intersectedObjects[0].object).onSelect(this.previousOutlinableFound).then(() =>
                    {
                        this.previousOutlinableFound.onDeselect();
                        this.previousOutlinableFound = null;
                        this.outlinePass.selectedObjects = [];
                        this.isSelectingSomething = false;
                    });
                }
                else
                {
                    this.previousOutlinableFound.onDeselect();
                    this.previousOutlinableFound = null;
                    this.outlinePass.selectedObjects = [];
                    this.isSelectingSomething = false;
                }
            }
        }

    }

    public trackWindowEvents()
    {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
    }
    public removeWindowEvents()
    {
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('click', this.onMouseClick.bind(this));
        window.removeEventListener('resize', this.onResize.bind(this));
    }

    public animate(): void
    {
        this.postEffectComposer.render();
    }
}
export interface ISelectable
{
    onSelect(outlined: IOutlinable): Promise<void>;
    isAvailable(): boolean;
    getModel(): THREE.Object3D;
    setIsAvailable(isAvailbale: boolean): void;
}
export interface IOutlinable
{
    onDeselect(): void;
    getModel(): THREE.Object3D;
    onOutline(): void;
}

