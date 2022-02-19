import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeMaster } from '../chessnavigation/chessnodemaster';
import { ChessNodeProvider } from '../chessnavigation/chessnodeprovider';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessPlayer } from './chessplayer';
import { MinimaxTreeNode, Simulator } from './MinimaxTree';

export class AIChessPlayer extends ChessPlayer implements Simulator
{
    // good to test with https://github.com/AnshGaikwad/Chess-World/tree/master/engines
    private aiType: AIType;
    private gameProvider: Readonly<ChessNodeProvider>;
    private color: PieceColor;
    private minimaxLevel = 4;
    moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>;
    constructor(aiType: AIType, provider: Readonly<ChessNodeProvider> , moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>, color: PieceColor)
    {
        super();
        this.aiType = aiType;
        this.gameProvider = provider;
        this.color = color;
        this.moveSubmiter = moveSubmiter;
    }
    movesGenerator(color: PieceColor): [ICaseBoardPosition, ChessNodeMaster][] {
        return this.gameProvider.getPossibleMoves(color);
    }
    moveSimulator(position: ICaseBoardPosition, master: ChessNodeMaster): void {
        this.gameProvider.setMasterAndUpdateBoardForSimulation(position, master);
    }
    previousMoveCanceller(): void {
        this.gameProvider.cancelPreviousSimulation();
    }
    scoreGetter(): number {
        return this.gameProvider.getTotal();
    }
    public play(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            const level = this.minimaxLevel;
            const minimaxRoot = new MinimaxTreeNode(null, this, this.color, level, false);
            const choosenMove = minimaxRoot.getElectedMove();
            while (this.gameProvider.cancelPreviousSimulation())
            {
                this.gameProvider.cancelPreviousSimulation();
            }
            const oldPosition = this.gameProvider.getNodeOf(choosenMove[1]).getPosition();
            this.moveSubmiter(choosenMove[0], oldPosition).then(() =>
            {
                resolve();
            });
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
