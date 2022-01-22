import { ICaseBoardPosition } from '../board/chessCase';
import { IPiecesRequestSupplier } from '../board/chessmovesmanager';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';

export class QueenPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/queen_-_low_poly/scene.gltf', color);
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        let possiblePosition = this.currentCase.getCasePosition();
        //
        possiblePosition.I -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.positionAvailabilityChecker.caseIsEmpty(possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.caseIsEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J + 1};
        }

        //
        possiblePosition = this.currentCase.getCasePosition();
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
    public getType(): Readonly<PieceType>
    {
        return PieceType.QUEEN;
    }
}
