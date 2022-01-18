import { ChessPiece } from '../pieces/chesspiece';

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
}
export class HumanChessPlayer extends ChessPlayer
{
    public play(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
