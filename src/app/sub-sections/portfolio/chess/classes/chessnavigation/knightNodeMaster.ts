import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';

export class KnightNodeMaster extends ChessNodeMaster
{
    constructor(color: PieceColor)
    {
        super(color);
        this.chessType = PieceType.KNIGHT;
        this.value *= 30;
    }
    public clone(): KnightNodeMaster
    {
        const knight = new KnightNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        knight.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        knight.hasMovedOnce = this.hasMovedOnce;
        return knight;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const positionInBoard = this.nodeProvider.getNodeOf(this).getPosition();
        possiblesMoves.push({I: positionInBoard.I + 2, J: positionInBoard.J + 1});
        possiblesMoves.push({I: positionInBoard.I + 2, J: positionInBoard.J - 1});
        possiblesMoves.push({I: positionInBoard.I - 2, J: positionInBoard.J + 1});
        possiblesMoves.push({I: positionInBoard.I - 2, J: positionInBoard.J - 1});
        possiblesMoves.push({I: positionInBoard.I + 1, J: positionInBoard.J + 2});
        possiblesMoves.push({I: positionInBoard.I + 1, J: positionInBoard.J - 2});
        possiblesMoves.push({I: positionInBoard.I - 1, J: positionInBoard.J + 2});
        possiblesMoves.push({I: positionInBoard.I - 1, J: positionInBoard.J - 2});

        return possiblesMoves.filter(position => this.isAValidPosition(position) && //
                                    (this.nodeProvider.getNode(position).isFree() || this.nodeProvider.getNode(position).isOccupiedByOpponent(this.color)) //
                                    && this.positionIsSafeForTheKing(position));
    }

}
