import { ICaseBoardPosition } from '../board/chessCase';
import { PieceType } from '../pieces/chesspiece';
import { ChessPlayer } from './chessplayer';

export class AIChessPlayer extends ChessPlayer
{
    private aiType: AIType;
    constructor(aiType: AIType)
    {
        super();
        this.aiType = aiType;
    }
    public play(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        throw new Error('Method not implemented.');
    }

}
export enum AIType
{
    DFS,
    REINFORCEMENT,
    BAYSIAN
}
