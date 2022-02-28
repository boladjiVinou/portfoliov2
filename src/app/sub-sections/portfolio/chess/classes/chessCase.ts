import * as THREE from 'three';
export abstract class ChessCase extends THREE.Mesh implements IVisitedCase
{
    public static width = 150;
    public static height = 50;
    public static depth = 150;
    private positionInBoard: ICaseBoardPosition;
    private currentVisitor: ICaseVisitor = null;
    constructor(material: THREE.Material,  position: ICaseBoardPosition)
    {
        super(new THREE.BoxGeometry(ChessCase.width, ChessCase.height, ChessCase.depth), material);
        this.positionInBoard = position;
    }
    hasAccepted(visitor: ICaseVisitor): boolean
    {
        return this.currentVisitor === visitor;
    }
    getCase3dPosition(): THREE.Vector3
    {
        return this.position.clone();
    }
    getCasePosition(): ICaseBoardPosition
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
        const tmpMat = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0.738, 0.644, 0.539)//
            , emissive: new THREE.Color(0, 0, 0), roughness: 0.5, metalness: 0, flatShading: false, wireframe: false, vertexColors: false, fog: false});
        super(tmpMat, position);
    }
}
export class BlackChessCase extends ChessCase {
    constructor(position: ICaseBoardPosition)
    {
        const material = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0, 0, 0)//
                    , emissive: new THREE.Color(0, 0, 0), roughness: 0.50, metalness: 0, flatShading: false, wireframe: false, vertexColors: false, fog: false});
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
    quitCase(): void;
}
export interface IVisitedCase
{
    acceptVisitor(visitor: ICaseVisitor): void;
    removeVisitor(): void;
    getCasePosition(): ICaseBoardPosition;
    getCase3dPosition(): THREE.Vector3;
    hasAccepted(visitor: ICaseVisitor): boolean;
}
