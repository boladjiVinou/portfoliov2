import { ChessNodeState } from '../chessnavigation/chessnode';
import { SimulationMove } from '../chessnavigation/SimulationMove';
import { PieceColor } from '../pieces/chesspiece';

export interface Simulator
{
    movesGenerator(color: PieceColor): SimulationMove[];
    moveSimulator(move: SimulationMove): void;
    scoreGetter(): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: ChessNodeState[]): void;
    saveGameState(): ChessNodeState[];
}
export class MinimaxTreeNode
{
    private move: SimulationMove;
    private score: number;
    private electedChild: MinimaxTreeNode;
    private alpha = Number.MIN_SAFE_INTEGER;
    private beta = Number.MAX_SAFE_INTEGER;
    private isMax = true;
    // https://youtu.be/xBXHtz4Gbdo
    // https://www.mygreatlearning.com/blog/alpha-beta-pruning-in-ai/
    constructor(currentMove: SimulationMove, simulator: Simulator, color: PieceColor, step: number, parent: MinimaxTreeNode)
    {
        this.move = currentMove;
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
        if (simulator.gameIsNotOver() && step > 0 )
        {
            const nextColor = this.getOpponentColor(color);
            const childStep = --step;
            for (const value of simulator.movesGenerator(color))
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
        else
        {
            this.score = simulator.scoreGetter();
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
        return this.electedChild.move;
    }
}
