import * as THREE from 'three';
import { ICaseBoardPosition, ICaseVisitor, IVisitedCase } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { PieceModelLoader } from './piecemodelloader';
export abstract class ChessPiece implements ICaseVisitor
{
    private modelPath: string;
    private mesh: THREE.Object3D;
    protected positionAvailabilityChecker: IPiecesRequestSupplier;
    protected hasMovedOnce = false;
    protected color: PieceColor;
    protected currentCase: IVisitedCase;
    constructor(modelPath: string, color: PieceColor)
    {
        this.modelPath = modelPath;
        this.color = color;
    }
    visit( host: IVisitedCase): void
    {
        if (host.hasAccepted(this))
        {
            this.hasMovedOnce = (this.currentCase != null);
            this.currentCase = host;
            this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
        }
        else
        {
            throw new Error(':( You have a logic problem here, it is up to the visited case to decide who can visit it by using the accept method');
        }
    }
    quitCase(): void
    {
        this.currentCase.removeVisitor();
    }
    public init(): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                PieceModelLoader.getInstance().getModel(this.modelPath).then((model) =>
                {
                    this.mesh = model;
                    this.mesh.scale.set(25, 25, 25);
                    if (this.color === PieceColor.BLACK)
                    {

                    }
                    else
                    {

                    }
                    resolve();
                    return;
                });
            });
    }
    public setNavigationChecker( mvtValidator: IPiecesRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
    }
    abstract getPossibleDestinations(): ICaseBoardPosition[];
    public canJumpOverOtherPieces(): boolean
    {
        return false;
    }
    protected set3DPosition(position: THREE.Vector3): void
    {
        this.mesh.position.set(position.x, position.y, position.z);
    }
    public getHasMovedOnce(): boolean
    {
        return this.hasMovedOnce;
    }
    public hasSameColor(piece: ChessPiece): boolean
    {
        return this.color === piece.color;
    }
    public getModel(): THREE.Object3D
    {
        return this.mesh;
    }
}
export enum PieceColor
{
    WHITE, BLACK
}


