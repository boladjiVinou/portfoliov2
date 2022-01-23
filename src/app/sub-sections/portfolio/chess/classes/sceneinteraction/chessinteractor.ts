import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChessCase } from '../board/chessCase';
import { ChessPiece } from '../pieces/chesspiece';
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
    private isEnabled = false;
    private choiceMadeSubject: BehaviorSubject<boolean>;
    private choiceMadeObservable: Observable<boolean>;
    private promotionValidationButton: THREE.Mesh;
    private promotionPreviousButton: THREE.Mesh;
    private promotionNextButton: THREE.Mesh;
    private buttonSize: number;
    private mouseClickCallback = (ev: MouseEvent) => {
        this.onMouseClick(ev);
    }
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
        this.choiceMadeSubject = new BehaviorSubject(false);
        this.choiceMadeObservable = this.choiceMadeSubject.asObservable();
        this.buttonSize = ChessCase.width / 5;
        const validationImg =  new THREE.TextureLoader().load( '../../../../../../assets/chess/correct.png' );
        this.promotionValidationButton = new THREE.Mesh(new THREE.PlaneGeometry(this.buttonSize, this.buttonSize), new THREE.MeshBasicMaterial({map: validationImg, transparent: true}));
        const previousImg =  new THREE.TextureLoader().load( '../../../../../../assets/chess/previous-button.png' );
        this.promotionPreviousButton = new THREE.Mesh(new THREE.PlaneGeometry(this.buttonSize, this.buttonSize), new THREE.MeshBasicMaterial({map: previousImg, transparent: true}));
        const nextImg =  new THREE.TextureLoader().load( '../../../../../../assets/chess/next-button.png' );
        /*this.promotionNextButton = new THREE.Mesh(new THREE.PlaneGeometry(this.buttonSize, this.buttonSize), new THREE.MeshBasicMaterial({map: nextImg, transparent: true}));
        this.promotionValidationButton.position.set(0, -1100, 0);
        this.promotionPreviousButton.position.set(0, -1100, this.buttonSize);
        this.promotionNextButton.position.set(0, -1100, -this.buttonSize);
        this.promotionValidationButton.rotateY(Math.PI / 2);
        this.promotionPreviousButton.rotateY(Math.PI / 2);
        this.promotionNextButton.rotateY(Math.PI / 2);
        scene.add(this.promotionValidationButton);
        scene.add(this.promotionNextButton);
        scene.add(this.promotionPreviousButton);*/
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
        const renderingZone = this.renderer.domElement.getBoundingClientRect();
        this.mousePosition.x = ( ( event.clientX - renderingZone.left ) / renderingZone.width ) * 2 - 1;
        this.mousePosition.y = - ( ( event.clientY - renderingZone.top ) / renderingZone.height ) * 2 + 1;
        this.mousePosition.z = 1;
        this.searchPointedObject();
    }
    private searchPointedObject()
    {
        if (!this.isSelectingSomething)
        {
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            let intersectedObjects = this.raycaster.intersectObjects(this.outlinables.filter(outlinable => outlinable.visible), true);
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
                    /*const pieceModel = (this.previousOutlinableFound as ChessPiece);
                    const piecePosition = pieceModel.getModel().position.clone();
                    this.promotionValidationButton.position.set(piecePosition.x, -1100, piecePosition.z);
                    this.promotionPreviousButton.position.set(piecePosition.x, -1100, piecePosition.z + this.buttonSize);
                    this.promotionNextButton.position.set(piecePosition.x, -1100, piecePosition.z - this.buttonSize);*/
                }
            }
            else if (this.previousOutlinableFound != null)
            {
                intersectedObjects = this.raycaster.intersectObjects(this.selectables.filter(selectable => selectable.isAvailable() && selectable.getModel().visible).map(selectable => selectable.getModel()), true);
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
                        this.choiceMadeSubject.next(true);
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

    public trackMouseClickEvents()
    {
        this.choiceMadeSubject.next(false);
        window.addEventListener('click', this.mouseClickCallback);
    }

    public removeMouseClickListener()
    {
        window.removeEventListener('click', this.mouseClickCallback);
    }


    public getChoiceMadeObservable(): Readonly<Observable<boolean>>
    {
        return this.choiceMadeObservable;
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

