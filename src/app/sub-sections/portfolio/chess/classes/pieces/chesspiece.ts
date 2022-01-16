import * as THREE from 'three';
import { ICaseBoardPosition, ICaseVisitor, IVisitedCase } from '../board/chessCase';
import { IPiecesRequestSupplier } from '../board/chessmovesmanager';
import { ChessPlayer } from '../player/chessplayer';
import { IOutlinable } from '../sceneinteraction/chessinteractor';
import { PieceModelLoader } from './piecemodelloader';
export abstract class ChessPiece implements ICaseVisitor, IOutlinable
{
    private modelPath: string;
    private mesh: THREE.Object3D;
    protected positionAvailabilityChecker: IPiecesRequestSupplier;
    protected hasMovedOnce = false;
    protected color: PieceColor;
    protected currentCase: IVisitedCase;
    private possibleDestinations: ICaseBoardPosition[];
    private owner: ChessPlayer;
    constructor(modelPath: string, color: PieceColor)
    {
        this.modelPath = modelPath;
        this.color = color;
    }
    onDeselect(): void
    {
        this.possibleDestinations.forEach( destination =>
        {
            this.positionAvailabilityChecker.setCaseAvailability(false, destination);
        });
        this.possibleDestinations = [];
    }
    onOutline(): void
    {
        this.possibleDestinations = this.getPossibleDestinations();
        this.possibleDestinations.forEach( destination =>
        {
            this.positionAvailabilityChecker.setCaseAvailability(true, destination);
        });
    }
    isFriendWith(piece: ChessPiece): boolean
    {
        return this.color === piece.color;
    }
    animatedVisit(host: IVisitedCase): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                if (host.hasAccepted(this))
                {
                    this.hasMovedOnce = (this.currentCase != null);
                    this.quitCase();
                    this.currentCase = host;
                    this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0))); // temporary
                    resolve();
                    return;
                }
                else
                {
                    throw new Error(':( You have a logic problem here, it is up to the visited case to decide who can visit it by using the accept method');
                }
            });
    }
    visit( host: IVisitedCase): void
    {
        if (host.hasAccepted(this))
        {
            this.hasMovedOnce = (this.currentCase != null);
            this.quitCase();
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
        if (this.hasMovedOnce)
        {
            this.currentCase.removeVisitor();
            this.currentCase = null;
        }
    }
    public init(): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                PieceModelLoader.getInstance().getModel(this.modelPath).then((model) =>
                {
                    this.mesh = model;
                    this.mesh.scale.set(25, 25, 25);
                    let material: THREE.Material;
                    if (this.color === PieceColor.BLACK)
                    {
                        material = new THREE.MeshPhongMaterial({color: 0x222222 });
                    }
                    else
                    {
                        material = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0x888888)//
                            , emissive: new THREE.Color(0x222222), roughness: 0, metalness: 0, flatShading: false, wireframe: false, vertexColors: false, fog: false});
                    }
                    this.getModel().name = this.getName();
                    this.mesh.traverse(child => {
                        if (child instanceof THREE.Mesh)
                        {
                            (child as THREE.Mesh).material = material.clone();
                        }
                        child.name = this.getName();
                    });
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
    public getName(): string
    {
        const dateStr = Date.now().toString(36); // convert num to base 36 and stringif
        const randomStr = Math.random().toString(36).substring(2, 8); // start at index 2 to skip decimal point
        return `${dateStr}-${randomStr}`;
    }
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
    public hasColor(color: PieceColor): boolean
    {
        return this.color === color;
    }
    public getModel(): THREE.Object3D
    {
        return this.mesh;
    }
    protected isAValidPosition(position: ICaseBoardPosition)
    {
        return position.I >= 0 && position.I < 8 && position.J >= 0 && position.J < 8;
    }
    public setOwner(player: ChessPlayer): void
    {
        this.owner = player;
    }
    public getOwner(): ChessPlayer
    {
        return this.owner;
    }
}
export enum PieceColor
{
    WHITE, BLACK
}


