import { ICaseBoardPosition, IVisitedCase } from '../board/chessCase';
import { IPawnSpecialRequestSupplier} from '../board/chessmovesmanager';
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
                this.mvtDirection *= -1;
            }
        }
        super.visit(host);
    }
    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquare;
    }
    public setNavigationChecker( mvtValidator: IPawnSpecialRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
        this.specialMovementValidator = mvtValidator;
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

        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += (1 * this.mvtDirection);
        possiblePosition.J -= 1;
        if (this.isAValidPosition(possiblePosition) && this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        // en passant
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        if (this.isAValidPosition(possiblePosition) && this.specialMovementValidator.canDoEnPassantMove(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
        }
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        if (this.isAValidPosition(possiblePosition) && this.specialMovementValidator.canDoEnPassantMove(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
        }
        return possiblesMoves;
    }
}
