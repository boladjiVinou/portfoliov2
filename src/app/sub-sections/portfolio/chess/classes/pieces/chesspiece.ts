import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
export abstract class ChessPiece
{
    private modelPath: string;
    private mesh: THREE.Object3D;
    protected positionInBoard: CaseBoardPosition;
    protected positionAvailabilityChecker: PiecesChessManager;
    protected hasMovedOnce = false;
    protected color: PieceColor;
    constructor(modelPath: string, position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        this.modelPath = modelPath;
        this.positionInBoard = position;
        this.positionAvailabilityChecker = mvtValidator;
        this.color = color;
    }
    protected loadModel(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            const loader = new GLTFLoader();
            loader.load(this.modelPath, (model: GLTF) =>
            {
                this.mesh = model.scene;
                resolve();
                return;
            },
            null,
            ( error ) =>
            {
                console.log( 'An error happened while loading chesspiece model', error );
            });

        });
    }
    abstract getPossibleDestinations(): CaseBoardPosition[];
    public canJumpOverOtherPieces(): boolean
    {
        return false;
    }
    public set3DPosition(position: THREE.Vector3): void
    {
        this.mesh.position.set(position.x, position.y, position.z);
    }
    public setBoardPosition(position: CaseBoardPosition)
    {
        if (!this.hasMovedOnce && this.positionInBoard.I !== position.I && this.positionInBoard.J !== position.J)
        {
            this.hasMovedOnce = true;
        }
        this.positionInBoard.I = position.I;
        this.positionInBoard.J = position.J;
    }
    public getHasMovedOnce(): boolean
    {
        return this.hasMovedOnce;
    }
    public hasSameColor(piece: ChessPiece): boolean
    {
        return this.color === piece.color;
    }
}
export enum PieceColor
{
    WHITE, BLACK
}


