import * as THREE from 'three';
import { IOutlinable, ISelectable } from '../sceneinteraction/chessinteractor';
export abstract class ChessCase extends THREE.Mesh implements IVisitedCase, ISelectable
{
    public static width = 150;
    public static height = 50;
    public static depth = 150;
    private positionInBoard: ICaseBoardPosition;
    private currentVisitor: ICaseVisitor = null;
    protected available = false;
    constructor(material: THREE.Material, position: ICaseBoardPosition)
    {
        super(ChessCase.generateGeometry(), [material, new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0x48b15d)//
            , emissive: new THREE.Color(0, 0, 0), roughness: 0, metalness: 0.39, flatShading: false, wireframe: false, vertexColors: false, fog: false})]);
        this.positionInBoard = position;
    }
    private static generateGeometry(): THREE.BoxGeometry
    {
        const geo = new THREE.BoxGeometry(ChessCase.width, ChessCase.height, ChessCase.depth);
        geo.clearGroups();
        geo.addGroup(0, geo.index.count, 0);
        return geo;
    }
    setIsAvailable(isAvailable: boolean): void
    {
        this.available = isAvailable;
        // https://stackoverflow.com/questions/43694731/three-js-switch-between-lambert-and-phong
        // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom_selective
        if (this.available)
        {
            this.geometry.groups[0].materialIndex = 1;
        }
        else
        {
            this.geometry.groups[0].materialIndex = 0;
        }
    }
    isAvailable(): boolean
    {
        return this.available;
    }
    onSelect( outlined: IOutlinable): Promise<void>
    {
        return this.animatedAccept(outlined as any as ICaseVisitor);
    }
    getModel(): THREE.Object3D
    {
        return this as THREE.Object3D;
    }
    public getVisitor(): ICaseVisitor
    {
        return this.currentVisitor;
    }
    public animatedAccept(visitor: ICaseVisitor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                this.currentVisitor = visitor;
                this.currentVisitor.animatedVisit(this).then(() =>
                {
                    resolve();
                    return;
                });
            });
    }
    public hasAccepted(visitor: ICaseVisitor): boolean
    {
        return this.currentVisitor === visitor;
    }
    public getCase3dPosition(): THREE.Vector3
    {
        return this.position.clone();
    }
    public getCasePosition(): ICaseBoardPosition
    {
        return {I: this.positionInBoard.I, J: this.positionInBoard.J};
    }
    public removeVisitor(): void
    {
        this.currentVisitor = null;
    }
    public acceptVisitor(visitor: ICaseVisitor): void
    {
        this.currentVisitor = visitor;
        this.currentVisitor.visit(this);
    }
    public isEmpty(): boolean
    {
        return this.currentVisitor == null;
    }
}

export class WhiteChessCase extends ChessCase {
    constructor(position: ICaseBoardPosition)
    {
        const tmpMat = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(1, 1, 1)//
            , emissive: new THREE.Color(0, 0, 0), roughness: 0.25, metalness: 0.3, flatShading: false, wireframe: false, vertexColors: false, fog: false});
        super(tmpMat, position);
    }
}
export class BlackChessCase extends ChessCase {
    constructor(position: ICaseBoardPosition)
    {
        const material = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0, 0, 0)//
                    , emissive: new THREE.Color(0, 0, 0), roughness: 0.25, metalness: 0.3, flatShading: false, wireframe: false, vertexColors: false, fog: false});
        super(material, position);
    }
}

export interface ICaseBoardPosition
{
    I: number;
    J: number;
}
export interface ICaseVisitor
{
    visit(host: IVisitedCase): void;
    animatedVisit(host: IVisitedCase): Promise<void>;
    quitCase(): void;
}
export interface IVisitedCase
{
    acceptVisitor(visitor: ICaseVisitor): void;
    animatedAccept(visitor: ICaseVisitor): Promise<void>;
    removeVisitor(): void;
    getCasePosition(): ICaseBoardPosition;
    getCase3dPosition(): THREE.Vector3;
    hasAccepted(visitor: ICaseVisitor): boolean;
    getVisitor(): ICaseVisitor;
}

