import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
export class ChessInteractor
{
    private outlinables: THREE.Object3D[];
    private outlinablesMap: Map<string, IOutlinable>;
    private previousOutlinableFound: IOutlinable = null;
    private selectablesMap: Map<string, ISelectable>;
    private selectables: Readonly<ISelectable[]>;
    private renderer: THREE.WebGLRenderer;
    private postEffectComposer: EffectComposer;
    private mousePosition: THREE.Vector3 = new THREE.Vector3();
    private raycaster: THREE.Raycaster;
    private camera: THREE.Camera;
    private outlinePass: OutlinePass;
    private isSelectingSomething = false;
    private  scene: THREE.Scene;
    private isEnabled = false;
    constructor(outlinables: Readonly<IOutlinable[]>, selectables: Readonly<ISelectable[]>, renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera)
    {
        this.outlinables = outlinables.map(piece => piece.getModel());
        this.outlinablesMap = new Map(outlinables.map(obj => [obj.getModel().uuid, obj]));
        this.selectablesMap = new Map(selectables.map(obj => [obj.getModel().uuid, obj]));
        this.selectables = selectables;
        this.renderer = renderer;
        this.postEffectComposer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(scene, camera);
        this.postEffectComposer.addPass(renderPass);
        this.outlinePass = new OutlinePass(new THREE.Vector2(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight), scene, camera);
        this.outlinePass.renderToScreen = false;
        this.outlinePass.edgeStrength = 70;
        this.outlinePass.visibleEdgeColor.set(0xffffff);
        this.outlinePass.hiddenEdgeColor.set(0xffffff);
        this.postEffectComposer.addPass(this.outlinePass);
        this.raycaster = new THREE.Raycaster();
        this.camera = camera;
        this.scene = scene;
    }
    public setEnable(isEnabled: boolean): void
    {
        this.isEnabled = isEnabled;
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
        const renderingZone = this.renderer.domElement.getBoundingClientRect();
        this.mousePosition.x = ( ( event.clientX - renderingZone.left ) / renderingZone.width ) * 2 - 1;
        this.mousePosition.y = - ( ( event.clientY - renderingZone.top ) / renderingZone.height ) * 2 + 1;
        this.mousePosition.z = 1;
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
                let node: THREE.Object3D;
                for (const intersection of intersectedObjects)
                {
                    node = intersection.object;
                    while (!this.outlinablesMap.has(node.uuid))
                    {
                        node = node.parent;
                    }
                    if (this.outlinablesMap.has(node.uuid))
                    {
                        break;
                    }
                }
                if (this.outlinablesMap.has(node.uuid))
                {
                    this.outlinablesMap.get(node.uuid).onOutline();
                    this.previousOutlinableFound = this.outlinablesMap.get(node.uuid);
                    this.outlinePass.selectedObjects = [node];
                    this.outlinePass.renderToScreen = true;
                }
            }
            else if (this.previousOutlinableFound != null)
            {
                intersectedObjects = this.raycaster.intersectObjects(this.selectables.filter(selectable => selectable.isAvailable()).map(selectable => selectable.getModel()), true);
                if (intersectedObjects.length > 0)
                {
                    this.isSelectingSomething = true;
                    let node: THREE.Object3D;
                    for (const intersection of intersectedObjects)
                    {
                        node = intersection.object;
                        while (!this.selectablesMap.has(node.uuid))
                        {
                            node = node.parent;
                        }
                        if (this.selectablesMap.has(node.uuid))
                        {
                            break;
                        }
                    }
                    this.selectablesMap.get(node.uuid).onSelect(this.previousOutlinableFound).then(() =>
                    {
                        this.previousOutlinableFound.onDeselect();
                        this.previousOutlinableFound = null;
                        this.outlinePass.selectedObjects = [];
                        this.isSelectingSomething = false;
                        this.outlinePass.renderToScreen = false;
                    });
                }
                else
                {
                    this.previousOutlinableFound.onDeselect();
                    this.previousOutlinableFound = null;
                    this.outlinePass.selectedObjects = [];
                    this.isSelectingSomething = false;
                    this.outlinePass.renderToScreen = false;
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
        if (this.isEnabled)
        {
            this.postEffectComposer.render();
        }
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

