import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessNodeMaster, ChessNodeMasterState } from './chessnodemaster';

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
        this.value *= 900;
    }

    public isDoingALeftCastling(targetPosition: ICaseBoardPosition): boolean
    {
        return (targetPosition.I === this.leftCastlingPosition.I) && (targetPosition.J === this.leftCastlingPosition.J);
    }
    public isDoingARightCastling(targetPosition: ICaseBoardPosition): boolean
    {
        return (targetPosition.I === this.rightCastlingPosition.I) && (targetPosition.J === this.rightCastlingPosition.J);
    }

    public clone(): KingNodeMaster
    {
        const king = new KingNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        king.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        king.hasMovedOnce = this.hasMovedOnce;
        king.canDoARightCastling = this.canDoARightCastling;
        king.canDoAleftCastling = this.canDoAleftCastling;
        return king;
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

    public getState(): ChessNodeMasterState
    {
        return new KingNodeMasterState(this);
    }
    public restoreState(state: KingNodeMasterState): void
    {
        super.restoreState(state);
        this.canDoARightCastling = state.getCanDoARightCastling();
        this.canDoAleftCastling = state.getCandDoALeftCastling();
    }
}

export class KingNodeMasterState extends ChessNodeMasterState
{
    private readonly canDoARightCastling: boolean;
    private readonly canDoAleftCastling: boolean;
    constructor(master: KingNodeMaster)
    {
        super(master);
        this.canDoARightCastling = master.canDoARightCastling;
        this.canDoAleftCastling = master.canDoAleftCastling;
    }
    public getCanDoARightCastling(): boolean
    {
        return this.canDoARightCastling;
    }
    public getCandDoALeftCastling(): boolean
    {
        return this.canDoAleftCastling;
    }
}
