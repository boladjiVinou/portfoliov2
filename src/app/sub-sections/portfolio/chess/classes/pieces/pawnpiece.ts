import * as THREE from 'three';
import { ICaseBoardPosition, IVisitedCase } from '../board/chessCase';
import { IPawnSpecialRequestSupplier, IPiecesRequestSupplier} from '../board/chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class PawnPiece extends ChessPiece
{
    private mvtDirection = 1;
    private hasMovedTwoSquare = false;
    private specialMovementValidator: IPawnSpecialRequestSupplier;
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_pawn/scene.gltf', color);
    }
    visit(host: IVisitedCase): void
    {
        if (!this.hasMovedOnce)
        {
            if (host.getCasePosition().I > 3)
            {
                this.mvtDirection = -1;
            }
        }
        super.visit(host);
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
                this.specialMovementValidator.realizeEnPassantCapture(this, potentialEnPassantPosition);
            }
        }
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        // front moves
        let possiblePosition = this.currentCase.getCasePosition();
        if (!this.hasMovedOnce)
        {
            possiblePosition.I += (2 * this.mvtDirection);
            if (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                possiblesMoves.push(possiblePosition);
            }
        }

        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += (1 * this.mvtDirection);
        if (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
        }

        // diagonal moves
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += (1 * this.mvtDirection);
        possiblePosition.J += 1;
        if (this.isAValidPosition(possiblePosition) && this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition) && this.specialMovementValidator.canDoEnPassantCapture(this, potentialEnPassantPosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += (1 * this.mvtDirection);
        possiblePosition.J -= 1;
        if (this.isAValidPosition(possiblePosition) && this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition2 = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition2.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition2) && this.specialMovementValidator.canDoEnPassantCapture(this, potentialEnPassantPosition2))
        {
            possiblesMoves.push(possiblePosition);
        }

        return possiblesMoves;
    }

    private isMovingInDiagonal(host: IVisitedCase): boolean
    {
        return host.getCasePosition().J !== this.currentCase.getCasePosition().J;
    }
}
