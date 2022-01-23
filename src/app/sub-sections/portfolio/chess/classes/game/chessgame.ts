import { IPawnPromoter } from '../../chess.component';
import { IGameRequestSupplier } from '../board/chessmovesmanager';
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
                this.botPlayer = new AIChessPlayer(aiType);
                renderingService.getChessboard().setPieceOwner(PieceColor.WHITE, this.humanPlayer);
                renderingService.getChessboard().setPieceOwner(PieceColor.BLACK, this.botPlayer);
                this.gameRequestsSupplier = renderingService.getChessboard().getGameRequestsSupplier();
                ChessPiece.AUDIO_MVT_PLAYER.initSound(renderingService.getCamera(), renderingService.getScene(), ChessPiece.MOVEMENT_SOUND_PATH).then(() =>
                {
                    resolve();
                    return;
                });
            });
    }
    public start(): void
    {
        this.humanPlayer.play();
    }
}
