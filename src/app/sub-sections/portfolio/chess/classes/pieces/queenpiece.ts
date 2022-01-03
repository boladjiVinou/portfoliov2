import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class QueenPiece extends ChessPiece
{
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        super('../../../../../../../assets/chess/queen_-_low_poly/scene.gltf', position, mvtValidator, color);
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

        // upper left search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        // upper right search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        // lower left search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition))
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        // lower right search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
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
