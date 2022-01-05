import { ICaseBoardPosition } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

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
        // upper search
        possiblePosition.I -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J};
        }
        // lower search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J};
        }
        // left search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J - 1};
        }
        // right search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J + 1};
        }

        // upper left search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        // upper right search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        // lower left search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        // lower right search
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves;
    }
}
