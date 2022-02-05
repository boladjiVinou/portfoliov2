import * as THREE from 'three';
import { IVisitedCase } from '../board/chessCase';
import { IPawnSpecialRequestSupplier, IPiecesRequestSupplier} from '../chessnavigation/chessnavigationmanager';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';

export class PawnPiece extends ChessPiece
{
    private mvtDirection = 1;
    private hasMovedTwoSquare = false;
    private specialMovementValidator: IPawnSpecialRequestSupplier;
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_pawn/scene.gltf', color);
    }
    firstVisit(host: IVisitedCase): void
    {
        if (!this.hasMovedOnce)
        {
            if (host.getCasePosition().I > 3)
            {
                this.mvtDirection = -1;
            }
        }
        super.firstVisit(host);
    }
    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquare;
    }
    public setNavigationChecker( mvtValidator: IPiecesRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
        this.specialMovementValidator = mvtValidator as IPawnSpecialRequestSupplier;
    }
    animatedVisit(host: IVisitedCase): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                this.hasMovedTwoSquare = (Math.abs(host.getCasePosition().I - this.currentCase.getCasePosition().I) === 2);
                this.doEnpassantCaptureIfPossible(host);
                this.captureHostVisitorIfNeeded(host);
                this.positionAvailabilityChecker.notifyMove(this, host.getCasePosition());
                ChessPiece.AUDIO_MVT_PLAYER.playSound(false);
                this.hasMovedOnce = (this.currentCase != null);
                this.quitCase();
                this.currentCase = host;
                this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
                resolve();
                return;
            });
    }
    doEnpassantCaptureIfPossible(host: IVisitedCase)
    {
        if (this.isMovingInDiagonal(host))
        {
            const potentialEnPassantPosition = host.getCasePosition();
            potentialEnPassantPosition.I -= (this.mvtDirection);
            if (this.isAValidPosition(potentialEnPassantPosition) && this.specialMovementValidator.canDoEnPassantCapture(this, potentialEnPassantPosition))
            {
                this.specialMovementValidator.realizeCapture(this, potentialEnPassantPosition);
            }
        }
    }

    private isMovingInDiagonal(host: IVisitedCase): boolean
    {
        return host.getCasePosition().J !== this.currentCase.getCasePosition().J;
    }
    public getType(): Readonly<PieceType>
    {
        return PieceType.PAWN;
    }
}
