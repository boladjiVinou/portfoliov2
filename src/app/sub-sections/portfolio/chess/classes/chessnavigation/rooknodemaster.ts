import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessNodeMaster } from './chessnodemaster';

export class RookNodeMaster extends ChessNodeMaster
{
    constructor(color: PieceColor)
    {
        super(color);
        this.chessType = PieceType.ROOK;
        this.value *= 50;
    }
    public clone(): RookNodeMaster
    {
        const rook = new RookNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        rook.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        rook.hasMovedOnce = this.hasMovedOnce;
        return rook;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        let possiblePosition = {I: currentPosition.I , J: currentPosition.J};
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
        possiblePosition = {I: currentPosition.I , J: currentPosition.J};
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
        possiblePosition = {I: currentPosition.I , J: currentPosition.J};
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
        possiblePosition = {I: currentPosition.I , J: currentPosition.J};
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
        return possiblesMoves.filter(position => this.positionIsSafeForTheKing(position));
    }

}
