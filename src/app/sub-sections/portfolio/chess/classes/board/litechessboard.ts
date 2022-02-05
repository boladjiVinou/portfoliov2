import { ChessPiece, PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessBoard } from './chessboard';
import { ICaseBoardPosition } from './chessCase';
import { LitePiece } from './LitePiece';

export class LiteChessBoard
{
    private caseByPiece: Map<LitePiece, ICaseBoardPosition> = new Map();
    private pieceByCase: LitePiece[][] = [];
    private litePieces: LitePiece[] = [];
    private whiteKing: LitePiece;
    private blackKing: LitePiece;
    constructor( board: Readonly<ChessBoard>)
    {
        this.initializePieceByCase();
        const realBoard = board.getBoard();
        realBoard.forEach(line => {
            line.forEach( pCase =>
                {
                    if (!pCase.isEmpty())
                    {
                        const visitor = (pCase.getVisitor() as ChessPiece);
                        const piece = new LitePiece(visitor);
                        this.litePieces.push(piece);
                        const position = pCase.getCasePosition();
                        this.pieceByCase[position.I][position.J] = piece;
                        this.caseByPiece.set( piece, {I: position.I, J: position.J});
                        if (piece.hasSameColor(PieceColor.WHITE) && piece.getType() === PieceType.KING)
                        {
                            this.whiteKing = piece;
                        }
                        else if (piece.hasSameColor(PieceColor.BLACK) && piece.getType() === PieceType.KING)
                        {
                            this.blackKing = piece;
                        }
                    }
                });
        });
    }
    private initializePieceByCase()
    {
        for (let i = 0; i < 8; ++i)
        {
            const line: LitePiece[] = [];
            for (let j = 0; j < 8; ++j)
            {
                line.push(null);
            }
            this.pieceByCase.push(line);
        }
    }
    public isEmpty(position: ICaseBoardPosition)
    {
        return this.pieceByCase[position.I][position.J] === null;
    }
    public isOccupiedByOpponent(color: PieceColor , position: ICaseBoardPosition)
    {
        if (this.isEmpty(position))
        {
            return false;
        }
        return this.pieceByCase[position.I][position.J].getColor() !== color;
    }
    public getPieces(): LitePiece[]
    {
        return this.litePieces;
    }
    public setPiece(position: ICaseBoardPosition , piece: LitePiece)
    {
        if (piece != null)
        {
            if (!piece.getHasMovedOnce() && piece.getType() === PieceType.PAWN)
            {
                const oldPosition = this.getPosition(piece);
                piece.setHasMovedTwoSquares(position.J === oldPosition.J && Math.abs(position.I - oldPosition.I) === 2 );
                piece.setHasMovedOnce(true);
            }
        }
        this.caseByPiece.delete(piece);
        this.pieceByCase[position.I][position.J] = piece;
        this.caseByPiece.set(piece, {I: position.I, J: position.J});
    }
    public getPiece(position: ICaseBoardPosition): LitePiece
    {
        return this.pieceByCase[position.I][position.J];
    }
    public getPosition(piece: LitePiece): ICaseBoardPosition
    {
        const position = this.caseByPiece.get(piece);
        return {I: position.I, J: position.J};
    }
    public getWhiteKing(): LitePiece
    {
        return this.whiteKing;
    }
    public getBlackKing(): LitePiece
    {
        return this.blackKing;
    }
}
