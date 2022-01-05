import { ICaseBoardPosition } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';
import { KingPiece } from './kingpiece';

export class RookPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_rook/scene.gltf', color);
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
        return possiblesMoves;
    }
    castleWith(king: KingPiece): void
    {
        throw new Error('not yet implemented');
    }
}
