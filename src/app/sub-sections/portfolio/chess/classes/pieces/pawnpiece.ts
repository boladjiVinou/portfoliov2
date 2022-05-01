import * as THREE from 'three';
import { ChessCase, IVisitedCase } from '../board/chessCase';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { IPawnSpecialRequestSupplier, IPiecesRequestSupplier} from '../chessnavigation/chessnavigationmanager';
import { ChessPiece } from './chesspiece';
import { PieceColor } from './PieceColor';
import { PieceType } from './PieceType';

export class PawnPiece extends ChessPiece
{
    private mvtDirection = 1;
    private hasMovedTwoSquare = false;
    private specialMovementValidator: IPawnSpecialRequestSupplier;
    private enPassantTargetPos: ICaseBoardPosition = null;
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
    onDeselect(): void
    {
        const currentPosition = this.getCurrentCase().getCasePosition();
        this.possibleDestinations.forEach( destination =>
        {
            const target = {I: destination.I - this.mvtDirection, J: destination.J};
            if (this.enPassantTargetPos !== null && this.enPassantTargetPos.I === target.I && this.enPassantTargetPos.J === target.J)
            {
                this.positionAvailabilityChecker.showIsInDanger(false, target);
            }
            this.positionAvailabilityChecker.setCaseAvailability(false, destination);
        });
        this.enPassantTargetPos = null;
        this.possibleDestinations = [];
    }
    onOutline(): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.getPossibleDestinations().then(positions =>
            {
                this.possibleDestinations = positions;
                const currentPosition = this.getCurrentCase().getCasePosition();
                this.possibleDestinations.forEach( destination =>
                {
                    if (currentPosition.J !== destination.J && this.positionAvailabilityChecker.caseIsEmpty(destination))
                    {
                        const target = {I: destination.I - this.mvtDirection, J: destination.J};
                        this.positionAvailabilityChecker.showIsInDanger(true, target);
                        this.enPassantTargetPos = target;
                    }
                    this.positionAvailabilityChecker.setCaseAvailability(true, destination);
                });
                resolve();
            });
        });
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
                this.doEnpassantCaptureIfPossible(host).then(() =>
                {
                    this.captureHostVisitorIfNeeded(host).then(() =>
                    {
                        this.positionAvailabilityChecker.notifyMove(this, host.getCasePosition()).then(() =>
                        {
                            ChessPiece.AUDIO_MVT_PLAYER.playSound(false);
                            this.hasMovedOnce = (this.currentCase != null);
                            this.quitCase();
                            this.currentCase = host;
                            this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, ChessCase.height - 60, 0)));
                            resolve();
                            return;
                        });
                    });
                });
            });
    }
    doEnpassantCaptureIfPossible(host: IVisitedCase): Promise<void>
    {
        return new Promise(resolve =>
        {
            if (this.isMovingInDiagonal(host))
            {
                const potentialEnPassantPosition = host.getCasePosition();
                potentialEnPassantPosition.I -= (this.mvtDirection);
                this.specialMovementValidator.canDoEnPassantCapture(this, potentialEnPassantPosition).then(canDoEnPassant =>
                {
                    if (canDoEnPassant && this.isAValidPosition(potentialEnPassantPosition))
                    {
                        this.specialMovementValidator.realizeCapture(this, potentialEnPassantPosition).then(() =>
                        {
                            resolve();
                            return;
                        });
                    }
                    else
                    {
                        resolve();
                        return;
                    }
                });
            }
            else
            {
                resolve();
                return;
            }
        });
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
