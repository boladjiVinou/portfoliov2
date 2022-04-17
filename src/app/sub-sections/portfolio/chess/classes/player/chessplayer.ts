import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessPiece } from '../pieces/chesspiece';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';

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
    public abstract getColor(): PieceColor;
    public abstract selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType>;
}


