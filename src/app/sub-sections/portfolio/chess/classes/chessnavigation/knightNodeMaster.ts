import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
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
        const iPlus2 = positionInBoard.I + 2;
        const iMinus2 = positionInBoard.I - 2;
        const iPlus1 = positionInBoard.I + 1;
        const iMinus1 = positionInBoard.I - 1;
        const jPlus1 = positionInBoard.J + 1;
        const jMinus1 = positionInBoard.J - 1;
        const jPlus2 = positionInBoard.J + 2;
        const jMinus2 = positionInBoard.J - 2;
        possiblesMoves.push({I: iPlus2, J: jPlus1});
        possiblesMoves.push({I: iPlus2, J: jMinus1});
        possiblesMoves.push({I: iMinus2, J: jPlus1});
        possiblesMoves.push({I: iMinus2, J: jMinus1});
        possiblesMoves.push({I: iPlus1, J: jPlus2});
        possiblesMoves.push({I: iPlus1, J: jMinus2});
        possiblesMoves.push({I: iMinus1, J: jPlus2});
        possiblesMoves.push({I: iMinus1, J: jMinus2});

        return possiblesMoves.filter(position => this.isAValidPosition(position) && //
                                    (this.nodeProvider.getNode(position).isFree() || this.nodeProvider.getNode(position).isOccupiedByOpponent(this.color)) //
                                    && this.positionIsSafeForTheKing(position));
    }

}
