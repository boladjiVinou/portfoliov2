import { IPawnPromoter } from '../../chess.component';
import { IGameRequestSupplier } from '../chessnavigation/chessnavigationmanager';
import { ChessPiece, PieceColor } from '../pieces/chesspiece';
import { AIChessPlayer, AIType } from '../player/aichessplayer';
import { ChessPlayer } from '../player/chessplayer';
import { HumanChessPlayer } from '../player/humanchessplayer';
import { ChessRenderingService } from '../rendering/chessrendering.service';

export class ChessGame
{
    private humanPlayer: ChessPlayer;
    private botPlayer: ChessPlayer;
    private gameRequestsSupplier: Readonly<IGameRequestSupplier>;
    public init(renderingService: ChessRenderingService, pawnPromoter: IPawnPromoter, aiType: AIType): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                this.humanPlayer = new HumanChessPlayer(pawnPromoter, renderingService);
                this.gameRequestsSupplier = renderingService.getChessboard().getGameRequestsSupplier();
                this.botPlayer = new AIChessPlayer(aiType, this.gameRequestsSupplier.getProvider(), this.gameRequestsSupplier.realizeMove.bind(this.gameRequestsSupplier), PieceColor.BLACK);
                renderingService.getChessboard().setPieceOwner(PieceColor.WHITE, this.humanPlayer);
                renderingService.getChessboard().setPieceOwner(PieceColor.BLACK, this.botPlayer);
                ChessPiece.AUDIO_MVT_PLAYER.initSound(renderingService.getCamera(), renderingService.getScene(), ChessPiece.MOVEMENT_SOUND_PATH).then(() =>
                {
                    resolve();
                    return;
                });
            });
    }
    public start(): void
    {
        this.playerRoutine(this.humanPlayer, this.botPlayer, PieceColor.WHITE);
    }
    private playerRoutine(player: ChessPlayer, nextPlayer: ChessPlayer, color: PieceColor): void
    {
        let isInCheck = this.gameRequestsSupplier.kingIsInCheck(color);
        player.play().then(() =>
            {
                if (isInCheck)
                {
                    isInCheck = isInCheck && this.gameRequestsSupplier.kingIsInCheck(color);
                }
                if (!isInCheck)
                {
                    this.playerRoutine(nextPlayer, player, (color === PieceColor.BLACK ) ? PieceColor.WHITE : PieceColor.BLACK);
                }
                else
                {
                    alert(' end of game ');
                }
            });
    }
}
