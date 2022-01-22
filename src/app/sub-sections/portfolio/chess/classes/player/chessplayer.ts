import { Subscription } from 'rxjs';
import { IPawnPromoter } from '../../chess.component';
import { ICaseBoardPosition } from '../board/chessCase';
import { ChessPiece, PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessRenderingService } from '../rendering/chessrendering.service';
import { ChessInteractor } from '../sceneinteraction/chessinteractor';

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
export class HumanChessPlayer extends ChessPlayer
{
    pawnPromoter: IPawnPromoter;
    chessInteractor: ChessInteractor;
    constructor(pawnPromoter: Readonly<IPawnPromoter>, chessRenderingService: Readonly<ChessRenderingService>)
    {
        super();
        this.pawnPromoter = pawnPromoter;
        const board = chessRenderingService.getChessboard();
        this.chessInteractor = new ChessInteractor(board.getPieces().filter(piece => piece.hasColor(PieceColor.WHITE)), [].concat(...board.getBoard()), //
         chessRenderingService.getRenderer(), chessRenderingService.getScene(), chessRenderingService.getCamera());
        chessRenderingService.setChessInteractor(this.chessInteractor);
    }
    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        return this.pawnPromoter.askTypeToPromoteTo();
    }
    public play(): Promise<void>
    {
        return new Promise<void>(resolveMethod  =>
            {
                this.chessInteractor.setEnable(true);
                this.chessInteractor.trackMouseClickEvents();
                let choiceSubscription: Subscription;
                choiceSubscription = this.chessInteractor.getChoiceMadeObservable().subscribe((choiceMade: boolean) =>
                {
                    if (choiceMade)
                    {
                        choiceSubscription.unsubscribe();
                        this.chessInteractor.removeMouseClickListener();
                        this.chessInteractor.setEnable(false);
                        resolveMethod();
                        return;
                    }
                });
            });
    }
}
export class AIChessPlayer extends ChessPlayer
{
    public play(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        throw new Error('Method not implemented.');
    }

}
