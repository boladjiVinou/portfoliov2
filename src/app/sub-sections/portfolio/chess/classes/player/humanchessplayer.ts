import { Subscription } from 'rxjs';
import { IViewRequest } from '../../chess.component';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessRenderingService } from '../rendering/chessrendering.service';
import { ChessInteractor } from '../sceneinteraction/chessinteractor';
import { ChessPlayer } from './chessplayer';

export class HumanChessPlayer extends ChessPlayer
{
    pawnPromoter: IViewRequest;
    chessInteractor: ChessInteractor;
    color: PieceColor;
    constructor(pawnPromoter: Readonly<IViewRequest>, chessRenderingService: Readonly<ChessRenderingService>, color: PieceColor)
    {
        super();
        this.pawnPromoter = pawnPromoter;
        const board = chessRenderingService.getChessboard();
        this.chessInteractor = new ChessInteractor(board.getPieces().filter(piece => piece.hasColor(color)), [].concat(...board.getBoard()), //
         chessRenderingService.getRenderer(), chessRenderingService.getScene(), chessRenderingService.getCamera());
        chessRenderingService.setChessInteractor(this.chessInteractor);
        this.color = color;
    }
    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        return this.pawnPromoter.askTypeToPromoteTo();
    }
    public getColor(): PieceColor {
        return this.color;
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
                        this.chessInteractor.removeMouseClickListener();
                        this.chessInteractor.setEnable(false);
                        choiceSubscription.unsubscribe();
                        setTimeout(() => {
                            resolveMethod();
                            return;
                        }, 1000);
                    }
                });
            });
    }
}
