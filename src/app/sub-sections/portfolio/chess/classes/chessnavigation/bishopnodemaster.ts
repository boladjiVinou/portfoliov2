import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessNodeMaster } from './chessnodemaster';

export class BishopNodeMaster extends ChessNodeMaster
{
    constructor(color: PieceColor)
    {
        super(color);
        this.chessType = PieceType.BISHOP;
        this.value *= 30;
    }
    public clone(): BishopNodeMaster
    {
        const bishop = new BishopNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        bishop.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        bishop.hasMovedOnce = this.hasMovedOnce;
        return bishop;
    }
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
