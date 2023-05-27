import { IViewRequest } from '../../chess.component';
import { IGameRequestSupplier } from '../chessnavigation/chessnavigationmanager';
import { ChessPiece } from '../pieces/chesspiece';
import { PieceColor } from '../pieces/PieceColor';
import { AIChessPlayer, AIType } from '../player/aichessplayer';
import { ChessPlayer } from '../player/chessplayer';
import { HumanChessPlayer } from '../player/humanchessplayer';
import { ChessRenderingService } from '../rendering/chessrendering.service';

export class ChessGame
{
    private humanPlayer: ChessPlayer;
    private botPlayer: ChessPlayer;
    private gameRequestsSupplier: Readonly<IGameRequestSupplier>;
    public preInit(renderingService: ChessRenderingService, heavyProcesingNotifyer: (isProcessing: boolean) => void): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.gameRequestsSupplier = renderingService.getChessboard().getGameRequestsSupplier();
            this.gameRequestsSupplier.initCore(heavyProcesingNotifyer).then(() =>
            {
                resolve();
                return;
            });
        });
    }
    public init(renderingService: ChessRenderingService, viewRequest: IViewRequest, aiType: AIType, playerIsCpu: boolean, playerColor: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                if (playerIsCpu)
                {
                    this.humanPlayer = new AIChessPlayer(aiType, this.gameRequestsSupplier, playerColor);
                }
                else
                {
                    console.log('is human', playerColor);
                    this.humanPlayer = new HumanChessPlayer(viewRequest, renderingService, playerColor);
                }
                const opponentColor = (playerColor === PieceColor.BLACK) ? PieceColor.WHITE : PieceColor.BLACK;
                this.botPlayer = new AIChessPlayer(aiType, this.gameRequestsSupplier,  opponentColor);
                renderingService.getChessboard().setPieceOwner(playerColor, this.humanPlayer);
                renderingService.getChessboard().setPieceOwner(opponentColor, this.botPlayer);
                ChessPiece.AUDIO_MVT_PLAYER.initSound(renderingService.getCamera(), renderingService.getScene(), ChessPiece.MOVEMENT_SOUND_PATH).then(() =>
                {
                    resolve();
                    return;
                });
            });
    }
    public start(): void
    {
        if (this.humanPlayer.getColor() === PieceColor.WHITE)
        {
            this.playerRoutine(this.humanPlayer, this.botPlayer, PieceColor.WHITE);
        }
        else
        {
            this.playerRoutine(this.botPlayer, this.humanPlayer, PieceColor.WHITE);
        }
    }
    private playerRoutine(player: ChessPlayer, nextPlayer: ChessPlayer, color: PieceColor): void
    {
        this.gameRequestsSupplier.playerHasSomethingToDo(color).then(hasSomethingToDo =>
        {
            if (hasSomethingToDo)
            {
                this.gameRequestsSupplier.kingIsInCheck(color).then(isInCheck =>
                    {
                        const kingCaseOne = this.gameRequestsSupplier.getKingCase(color);
                        kingCaseOne.showIsInDanger(isInCheck);
                        player.play().then(() =>
                        {
                            kingCaseOne.showIsInDanger(false);
                            if (isInCheck)
                            {
                               this.gameRequestsSupplier.kingIsInCheck(color).then(againInCheck =>
                               {
                                    if (againInCheck)
                                    {
                                        this.gameRequestsSupplier.getKingCase(color).showIsInDanger(true);
                                        alert('Game Over');
                                    }
                                    else
                                    {
                                        this.playerRoutine(nextPlayer, player, (color === PieceColor.BLACK ) ? PieceColor.WHITE : PieceColor.BLACK);
                                    }
                               });
                            }
                            else
                            {
                                this.playerRoutine(nextPlayer, player, (color === PieceColor.BLACK ) ? PieceColor.WHITE : PieceColor.BLACK);
                            }
                        });
                    });
            }
            else
            {
                alert('Game Over');
            }
        });
    }
    public stop()
    {
        if (this.gameRequestsSupplier !== undefined && this.gameRequestsSupplier !== null)
        {
            this.gameRequestsSupplier.killCore();
        }
    }
}
