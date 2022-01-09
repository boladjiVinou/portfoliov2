import { ICaseBoardPosition } from '../board/chessCase';
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
        //
        let possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves;
    }
}
