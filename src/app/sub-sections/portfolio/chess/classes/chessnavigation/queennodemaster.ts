import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';

export class QueenNodeMaster extends ChessNodeMaster
{
    constructor(color: PieceColor)
    {
        super(color);
        this.chessType = PieceType.QUEEN;
        this.value *= 90;
    }
    public clone(): QueenNodeMaster
    {
        const queen = new QueenNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        queen.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        queen.hasMovedOnce = this.hasMovedOnce;
        return queen;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        let possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        //
        possiblePosition.I -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J};
        }
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J};
        }
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J - 1};
        }
        //
        possiblePosition =  {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I, J: possiblePosition.J + 1};
        }

        //
        possiblePosition =  {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition =  {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        //
        possiblePosition =  {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition =  {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree() || this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color)))
        {
            possiblesMoves.push(possiblePosition);
            if (!this.nodeProvider.getNode(possiblePosition).isFree())
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves.filter(position => this.positionIsSafeForTheKing(position));
    }

}
