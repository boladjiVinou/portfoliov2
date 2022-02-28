import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeState } from '../chessnavigation/chessnode';
import { ChessNodeMaster } from '../chessnavigation/chessnodemaster';
import { ChessNodeProvider } from '../chessnavigation/chessnodeprovider';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessPlayer } from './chessplayer';
import { MinimaxTreeNode, Simulator } from './MinimaxTreeNode';
// https://github.com/josdejong/workerpool

export class AIChessPlayer extends ChessPlayer implements Simulator
{
    // good to test with https://github.com/AnshGaikwad/Chess-World/tree/master/engines
    private aiType: AIType;
    private gameProvider: Readonly<ChessNodeProvider>;
    private color: PieceColor;
    private minimaxLevel = 3;
    private readonly delayBetweenActions: 2000;
    moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>;
    constructor(aiType: AIType, provider: Readonly<ChessNodeProvider> , moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>, color: PieceColor)
    {
        super();
        this.aiType = aiType;
        this.gameProvider = provider;
        this.color = color;
        this.moveSubmiter = moveSubmiter;
    }
    restoreGameState(nodeStates: ChessNodeState[]): void {
        this.gameProvider.restoreGameState(nodeStates);
    }
    saveGameState(): ChessNodeState[] {
        return this.gameProvider.saveGameState();
    }
    gameIsNotOver(): boolean {
        return this.gameProvider.hasKing(PieceColor.BLACK) && this.gameProvider.hasKing(PieceColor.WHITE);
    }
    movesGenerator(color: PieceColor): [ICaseBoardPosition, ChessNodeMaster][] {
        return this.gameProvider.getPossibleMoves(color);
    }
    moveSimulator(position: ICaseBoardPosition, master: ChessNodeMaster): void {
        this.gameProvider.simulateMove(position, master);
    }
    scoreGetter(): number {
        return this.gameProvider.getTotal();
    }
    public play(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            const level = this.minimaxLevel;
            const search = () => {
                const start = performance.now();
                const minimaxRoot = new MinimaxTreeNode(null, this, this.color, level, null);
                const end = performance.now();
                const choosenMove = minimaxRoot.getElectedMove();
                const oldPosition = this.gameProvider.getNodeOf(choosenMove[1]).getPosition();
                const waitingTime = Math.max(this.delayBetweenActions - (end - start), 1);
                setTimeout(() => {
                    this.moveSubmiter(choosenMove[0], oldPosition).then(() =>
                        {
                            resolve();
                            return;
                        });
                }, waitingTime);
            };
            if ('requestIdleCallback' in window)
            {
                (window as any).requestIdleCallback(() =>
                {
                    search();
                }, { timeout: 250 });
            }
            else
            {
                search();
            }
        });
    }

    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        return new Promise<PieceType>((resolve) => {
            resolve(PieceType.QUEEN);
        });
    }

}
export enum AIType
{
    MININMAX,
    REINFORCEMENT
}
