import { ChessPiece, PieceColor, PieceType } from '../pieces/chesspiece';
import { TransformablePawnPiece } from '../pieces/transformablePawnPiece';
import { ICaseBoardPosition } from './chessCase';
import { LiteChessBoard } from './litechessboard';

export class LitePiece
{
    private readonly pieceType: PieceType;
    private readonly pieceColor: PieceColor;
    private hasMovedTwoSquare = false;
    private hasMovedOnce = false;
    constructor(piece: ChessPiece)
    {
        this.pieceType = piece.getType();
        this.pieceColor = piece.hasColor(PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE;
        if (piece instanceof TransformablePawnPiece)
        {
            this.hasMovedTwoSquare = piece.getHasMovedTwoSquares();
        }
        this.hasMovedOnce = piece.getHasMovedOnce();
    }
    public getType(): PieceType
    {
        return this.pieceType;
    }
    public hasSameColor(color: PieceColor): boolean
    {
        return this.pieceColor === color;
    }
    public getColor(): PieceColor
    {
        return this.pieceColor;
    }
    public setHasMovedOnce(hasMoved: boolean)
    {
        this.hasMovedOnce = hasMoved;
    }
    public setHasMovedTwoSquares(hasMoved: boolean)
    {
        this.hasMovedTwoSquare = hasMoved;
    }
    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquare;
    }
    public getHasMovedOnce(): boolean
    {
        return this.hasMovedOnce;
    }
    public  getPossiblePositionsWithThisBoard(board: Readonly<LiteChessBoard>): ICaseBoardPosition[]
    {
        switch (this.pieceType)
        {
            case PieceType.BISHOP:
                return this.getBishopPositions(board);
            case PieceType.KING:
                break;
            case PieceType.KNIGHT:
                break;
            case PieceType.PAWN:
                break;
            case PieceType.QUEEN:
                break;
            case PieceType.ROOK:
                break;
        }
    }
    private getBishopPositions(board: Readonly<LiteChessBoard>): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        //
        let possiblePosition = board.getPosition(this);
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (board.isEmpty(possiblePosition) || board.isOccupiedByOpponent(this.pieceColor, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!board.isEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = board.getPosition(this);
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (board.isEmpty(possiblePosition) || board.isOccupiedByOpponent(this.pieceColor, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!board.isEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        //
        possiblePosition = board.getPosition(this);
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (this.isAValidPosition(possiblePosition) && (board.isEmpty(possiblePosition) || board.isOccupiedByOpponent(this.pieceColor, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!board.isEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        //
        possiblePosition = board.getPosition(this);
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (this.isAValidPosition(possiblePosition) && (board.isEmpty(possiblePosition) || board.isOccupiedByOpponent(this.pieceColor, possiblePosition)))
        {
            possiblesMoves.push(possiblePosition);
            if (!board.isEmpty(possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves;
    }
    private isAValidPosition(position: ICaseBoardPosition)
    {
        return position.I >= 0 && position.I < 8 && position.J >= 0 && position.J < 8;
    }
}
