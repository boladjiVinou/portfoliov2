import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeMaster } from './chessnodemaster';

export class KnightNodeMaster extends ChessNodeMaster
{
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
