import { ICaseBoardPosition } from '../board/chessCase';
import { ChessPiece, PieceType } from '../pieces/chesspiece';

export abstract class ChessPlayer
{
    private jail: ChessPiece[] = [];
    public abstract play(): Promise<void>;
    public capture(piece: ChessPiece)
    {
        this.jail.push(piece);
        piece.quitCase();
        piece.getModel().visible = false;
    }
    public abstract selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType>;
}


