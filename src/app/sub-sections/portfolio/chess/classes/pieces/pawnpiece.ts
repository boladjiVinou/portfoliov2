import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class PawnPiece extends ChessPiece
{
    private mvtDirection = 1;
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_pawn/scene.gltf', position, mvtValidator, color);
        this.positionInBoard = position;
        if (this.positionInBoard.I > 3)
        {
            this.mvtDirection *= -1;
        }
    }
    getPossibleDestinations(): CaseBoardPosition[]
    {
        const possiblesMoves: CaseBoardPosition[] = [];
        let possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        if (!this.hasMovedOnce)
        {
            possiblePosition.I += (2 * this.mvtDirection);
            if (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) )
            {
                possiblesMoves.push(possiblePosition);
                possiblePosition = {I: possiblePosition.I + (2 * this.mvtDirection), J: possiblePosition.J};
            }
        }
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += (1 * this.mvtDirection);
        if (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) )
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + (1 * this.mvtDirection), J: possiblePosition.J};
        }
        return possiblesMoves;
    }
}
