import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';

export class PawnNodeMaster extends ChessNodeMaster
{
    private mvtDirection;
    private hasMovedTwoSquares = false;
    constructor(color: PieceColor)
    {
        super(color);
        this.mvtDirection = (color === PieceColor.WHITE) ? -1 : 1;
    }
    public getMvtDirection()
    {
        return this.mvtDirection;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        // front moves
        let possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        if (!this.hasMoved())
        {
            possiblePosition.I += (2 * this.mvtDirection);
            if (this.nodeProvider.getNode(possiblePosition).isFree())
            {
                possiblesMoves.push(possiblePosition);
            }
        }

        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (1 * this.mvtDirection);
        if (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree()))
        {
            possiblesMoves.push(possiblePosition);
        }

        // diagonal moves
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (1 * this.mvtDirection);
        possiblePosition.J += 1;
        if (this.isAValidPosition(possiblePosition) && this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition) && this.canDoEnPassantCapture(potentialEnPassantPosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (1 * this.mvtDirection);
        possiblePosition.J -= 1;
        if (this.isAValidPosition(possiblePosition) && this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition2 = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition2.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition2) && this.canDoEnPassantCapture(potentialEnPassantPosition2))
        {
            possiblesMoves.push(possiblePosition);
        }

        console.log('get position called', possiblesMoves);
        return possiblesMoves.filter(position => this.positionIsSafeForTheKing(position));
    }

    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquares;
    }

    public setHasMovedTwoSquares(hasMoved: boolean): void
    {
        this.hasMovedTwoSquares = hasMoved;
    }

    public canDoEnPassantCapture(position: ICaseBoardPosition): boolean
    {
        if (!this.nodeProvider.getNode(position).isFree())
        {
            const positionOwner = this.nodeProvider.getNode(position).getOwner();
            return positionOwner.getColor() !== this.getColor() && (this instanceof PawnNodeMaster) && (this as PawnNodeMaster).getHasMovedTwoSquares();
        }
        else
        {
            return false;
        }
    }
}
