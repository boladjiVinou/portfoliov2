import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';
import { KingPiece } from './kingpiece';

export class RookPiece extends ChessPiece
{
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_rook/scene.gltf', position, mvtValidator, color);
        this.positionInBoard = position;
    }
    getPossibleDestinations(): CaseBoardPosition[]
    {
        const possiblesMoves: CaseBoardPosition[] = [];
        let possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        // upper search
        possiblePosition.I -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J};
        }
        // lower search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J};
        }
        // left search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J - 1};
        }
        // right search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
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
