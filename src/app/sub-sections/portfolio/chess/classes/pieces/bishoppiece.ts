import { ICaseBoardPosition } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class BishopPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_bishop/scene.gltf', color);
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        // upper left search
        let possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (possiblePosition.I >= 0 && possiblePosition.J >= 0)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        // upper right search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (possiblePosition.I >= 0 && possiblePosition.J < 8)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        // lower left search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (possiblePosition.I < 8 && possiblePosition.J >= 0)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        // lower right search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (possiblePosition.I < 8 && possiblePosition.J < 8)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves;
    }
}
