import { Subscription } from 'rxjs';
import { IPawnPromoter } from '../../chess.component';
import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessRenderingService } from '../rendering/chessrendering.service';
import { ChessInteractor } from '../sceneinteraction/chessinteractor';
import { ChessPlayer } from './chessplayer';

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
                        console.log('choice made event received');
                        this.chessInteractor.removeMouseClickListener();
                        this.chessInteractor.setEnable(false);
                        choiceSubscription.unsubscribe();
                        resolveMethod();
                        return;
                    }
                });
            });
    }
}
