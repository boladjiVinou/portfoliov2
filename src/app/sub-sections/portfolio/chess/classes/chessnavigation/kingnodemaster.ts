import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';

export class KingNodeMaster extends ChessNodeMaster
{
    private readonly leftCastlingPosition: ICaseBoardPosition;
    private readonly rightCastlingPosition: ICaseBoardPosition;
    canDoARightCastling: boolean;
    canDoAleftCastling: boolean;

    constructor(color: PieceColor)
    {
        super(color);
        if (color === PieceColor.BLACK)
        {
            this.leftCastlingPosition = {I: 0, J: 6};
            this.rightCastlingPosition = {I: 0, J: 2};
        }
        else
        {
            this.leftCastlingPosition = {I: 7, J: 2};
            this.rightCastlingPosition = {I: 7, J: 6};
        }
        this.chessType = PieceType.KING;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        let possiblesMoves: ICaseBoardPosition[] = [];
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        let possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        //
        possiblePosition.I -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);

        possiblesMoves = possiblesMoves.filter(position => this.isAValidPosition(position) && //
        ( this.nodeProvider.getNode(position).isFree() || this.nodeProvider.getNode(position).isOccupiedByOpponent(this.color)));

        if (!this.hasMoved())
        {
            this.canDoARightCastling = this.nodeProvider.canMakeARightCastling(this);
            this.canDoAleftCastling = this.nodeProvider.canMakeALeftCastling(this);
        }
        else
        {
            this.canDoARightCastling = false;
            this.canDoAleftCastling = false;
        }
        // castling search 1
        if (this.canDoARightCastling)
        {
            possiblesMoves.push({I: this.rightCastlingPosition.I, J: this.rightCastlingPosition.J});
        }
        // castling search 2
        if (this.canDoAleftCastling)
        {
            possiblesMoves.push({I: this.leftCastlingPosition.I, J: this.leftCastlingPosition.J});
        }
        return possiblesMoves.filter(pos => this.positionIsSafeForTheKing(pos));
    }

}
