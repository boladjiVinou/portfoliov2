import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class KnightPiece extends ChessPiece
{
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        super('../../../../../../../assets/chess/knight_-_low_poly/scene.gltf', position, mvtValidator, color);
        this.positionInBoard = position;
    }
    getPossibleDestinations(): CaseBoardPosition[]
    {
        const possiblesMoves: CaseBoardPosition[] = [];
        possiblesMoves.push({I: this.positionInBoard.I + 2, J: this.positionInBoard.J + 1});
        possiblesMoves.push({I: this.positionInBoard.I + 2, J: this.positionInBoard.J - 1});
        possiblesMoves.push({I: this.positionInBoard.I - 2, J: this.positionInBoard.J + 1});
        possiblesMoves.push({I: this.positionInBoard.I - 2, J: this.positionInBoard.J - 1});
        possiblesMoves.push({I: this.positionInBoard.I + 1, J: this.positionInBoard.J + 2});
        possiblesMoves.push({I: this.positionInBoard.I + 1, J: this.positionInBoard.J - 2});
        possiblesMoves.push({I: this.positionInBoard.I - 1, J: this.positionInBoard.J + 2});
        possiblesMoves.push({I: this.positionInBoard.I - 1, J: this.positionInBoard.J - 2});

        return possiblesMoves.filter(position => this.positionAvailabilityChecker.canMoveTo(this, position));
    }
    canJumpOverOtherPieces(): boolean
    {
        return true;
    }
}
