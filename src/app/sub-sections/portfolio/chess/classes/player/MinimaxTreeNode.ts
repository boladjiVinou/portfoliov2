import { ChessNodeState } from '../chessnavigation/chessnode';
import { SimulationMove } from '../chessnavigation/SimulationMove';
import { PieceColor } from '../pieces/PieceColor';

export interface ISimulator
{
    movesGenerator(color: PieceColor): SimulationMove[];
    moveSimulator(move: SimulationMove): void;
    scoreGetter(color: PieceColor): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: ChessNodeState[]): void;
    saveGameState(): ChessNodeState[];
    kingIsInDanger(isBlack: boolean): boolean;
    hasKing(color: PieceColor): boolean;
}
export class MinimaxTreeNode
{
    private move: SimulationMove;
    private score: number;
    private electedChild: MinimaxTreeNode = null;
    private alpha = Number.MIN_SAFE_INTEGER;
    private beta = Number.MAX_SAFE_INTEGER;
    private isMax = true;
    // https://youtu.be/xBXHtz4Gbdo
    // https://www.mygreatlearning.com/blog/alpha-beta-pruning-in-ai/
    // https://mathspp.com/blog/minimax-algorithm-and-alpha-beta-pruning
    constructor(currentMove: SimulationMove, simulator: ISimulator, color: PieceColor, step: number, parent: MinimaxTreeNode)
    {
        this.move = currentMove;
        this.isMax = (color === PieceColor.BLACK);
        let gameState: ChessNodeState[] = [];
        if (parent !== null)
        {
            this.isMax = !parent.isMax;
            this.alpha = parent.alpha;
            this.beta = parent.beta;
        }
        if (this.isMax)
        {
            this.score = Number.MIN_SAFE_INTEGER;
        }
        else
        {
            this.score = Number.MAX_SAFE_INTEGER;
        }
        if (this.move !== null)
        {
            gameState = simulator.saveGameState();
            simulator.moveSimulator(this.move);
        }
        const nextColor = this.getOpponentColor(color);
        const moves = simulator.movesGenerator(color);
        if (simulator.gameIsNotOver() && step > 0  && moves.length > 0)
        {
            const childStep = --step;
            for (const value of moves)
            {
                const child = new MinimaxTreeNode(value, simulator, nextColor, childStep , this);
                if (this.isMax)
                {
                    this.score = Math.max(this.score, child.score);
                    if (this.alpha < this.score)
                    {
                        this.electedChild = child;
                        this.alpha = this.score;
                    }
                    if (this.alpha >= this.beta)
                    {
                        break;
                    }
                }
                else
                {
                    this.score = Math.min(this.score, child.score);
                    if (this.beta > this.score)
                    {
                        this.electedChild = child;
                        this.beta = this.score;
                    }
                    if (this.beta <= this.alpha)
                    {
                        break;
                    }
                }
            }
        }
        else if (moves.length === 0)
        {
            this.score = simulator.scoreGetter(color);
            if (simulator.hasKing(color) && simulator.kingIsInDanger(color === PieceColor.BLACK))
            {
                if (color === PieceColor.BLACK)
                {
                    this.score -= 900;
                }
                else
                {
                    this.score += 900;
                }
            }
        }
        else
        {
            this.score = simulator.scoreGetter(color);
        }
        if (gameState.length > 0)
        {
            simulator.restoreGameState(gameState);
        }
    }
    private getOpponentColor(color: PieceColor): PieceColor
    {
        return (color === PieceColor.BLACK) ? PieceColor.WHITE : PieceColor.BLACK;
    }
    public getElectedMove(): SimulationMove
    {
        if (this.electedChild !== null)
        {
            return this.electedChild.move;
        }
        return null;
    }
}
