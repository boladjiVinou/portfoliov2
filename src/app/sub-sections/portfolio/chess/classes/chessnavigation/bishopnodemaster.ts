import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeMaster } from './chessnodemaster';

export class BishopNodeMaster extends ChessNodeMaster
{
    public getPositions(): ICaseBoardPosition[]
    {
        const currentHome = this.nodeProvider.getNodeOf(this);
        const currentPosition = currentHome.getPosition();
        const possiblesMoves: ICaseBoardPosition[] = [];
        //
        let possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree() )
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree()  || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree()  || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree()  || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }


        return possiblesMoves.filter(pos => this.positionIsSafeForTheKing(pos));
    }
}
