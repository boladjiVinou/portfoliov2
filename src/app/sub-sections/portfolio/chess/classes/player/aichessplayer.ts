import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { IPlayerRequestSupplier } from '../chessnavigation/chessnavigationmanager';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessPlayer } from './chessplayer';
// https://github.com/josdejong/workerpool

export class AIChessPlayer extends ChessPlayer
{
    // good to test with https://github.com/AnshGaikwad/Chess-World/tree/master/engines
    private aiType: AIType;
    private color: PieceColor;
    private readonly delayBetweenActions: 2000;
    private pawnPromotionType: PieceType = PieceType.QUEEN;
    private playerRequestSupplier: IPlayerRequestSupplier;
    moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>;
    constructor(aiType: AIType, playerRequestSupplier: IPlayerRequestSupplier, color: PieceColor)
    {
        super();
        this.aiType = aiType;
        this.color = color;
        this.playerRequestSupplier = playerRequestSupplier;
    }
    public getColor(): PieceColor {
        return this.color;
    }
    public play(): Promise<void>
    {
       return new Promise<void>((resolve) =>
        {
            this.playerRequestSupplier.getBestMovePossible(this.color).then(result =>
            {
                if (result.pawnPromotionType !== null && result.pawnPromotionType !== undefined)
                {
                    this.pawnPromotionType = result.pawnPromotionType;
                }
                this.playerRequestSupplier.realizeMove(result.move.destination, result.move.source).then(() =>
                {
                    resolve();
                    return;
                });
            });
        });

    }

    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        return new Promise<PieceType>((resolve) => {
            resolve(this.pawnPromotionType);
        });
    }

}
export enum AIType
{
    MININMAX,
    REINFORCEMENT
}
