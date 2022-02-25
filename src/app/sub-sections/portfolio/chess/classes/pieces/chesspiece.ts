import * as THREE from 'three';
import { AudioPlayer } from '../audio/audioplayer';
import { ChessCase, ICaseBoardPosition, ICaseVisitor, IVisitedCase } from '../board/chessCase';
import { IPiecesRequestSupplier } from '../chessnavigation/chessnavigationmanager';
import { ChessPlayer } from '../player/chessplayer';
import { IOutlinable } from '../sceneinteraction/chessinteractor';
import { PieceModelLoader } from './piecemodelloader';
export abstract class ChessPiece implements ICaseVisitor, IOutlinable
{
    public static readonly AUDIO_MVT_PLAYER = new AudioPlayer();
    public static readonly MOVEMENT_SOUND_PATH = '../../../../../../../assets/chess/piece-slide.mp3';
    private modelPath: string;
    private mesh: THREE.Object3D;
    protected positionAvailabilityChecker: IPiecesRequestSupplier;
    protected hasMovedOnce = false;
    protected color: PieceColor;
    protected currentCase: IVisitedCase = null;
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
                ChessPiece.AUDIO_MVT_PLAYER.playSound(false);
                this.hasMovedOnce = (this.currentCase != null);
                this.captureHostVisitorIfNeeded(host);
                this.positionAvailabilityChecker.notifyMove(this, host.getCasePosition());
                this.quitCase();
                this.currentCase = host;
                this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
                resolve();
                return;
            });
    }
    firstVisit( host: IVisitedCase): void
    {
        this.hasMovedOnce = (this.currentCase != null);
        // this.captureHostVisitorIfNeeded(host);
        this.quitCase();
        this.currentCase = host;
        this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
    }
    quitCase(): void
    {
        if (this.hasMovedOnce)
        {
            this.currentCase.removeVisitor();
            this.currentCase = null;
        }
    }
    protected captureHostVisitorIfNeeded(host: IVisitedCase)
    {
        this.positionAvailabilityChecker.realizeCapture(this, host.getCasePosition());
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
                        material = new THREE.MeshPhongMaterial({color: 0x393232 });
                    }
                    else
                    {
                        material = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0x888888)//
                            , emissive: new THREE.Color(0x222222), roughness: 0, metalness: 0, flatShading: false, wireframe: false, vertexColors: false, fog: false});
                    }
                    this.mesh.traverse(child => {
                        if (child instanceof THREE.Mesh)
                        {
                            (child as THREE.Mesh).material = material.clone();
                        }
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
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        return this.positionAvailabilityChecker.getPossibleDestinations(this.currentCase.getCasePosition());
    }
    public canJumpOverOtherPieces(): boolean
    {
        return false;
    }
    protected set3DPosition(position: THREE.Vector3): void
    {
        this.getModel().position.set(position.x, position.y, position.z);
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
    public getColor(): PieceColor
    {
        return this.color;
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
    public getCurrentCase(): Readonly<ChessCase>
    {
        return this.currentCase as Readonly<ChessCase>;
    }
    public isVisible(): boolean
    {
        return this.getModel().visible;
    }
    public abstract getType(): Readonly<PieceType>;
}
export enum PieceColor
{
    WHITE, BLACK
}
export enum PieceType
{
    KING, QUEEN, PAWN, ROOK, BISHOP, KNIGHT
}


