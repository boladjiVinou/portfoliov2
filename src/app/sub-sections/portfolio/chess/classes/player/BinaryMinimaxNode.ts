import { BinaryChessCoreState } from '../chessnavigation/binarChessCoreState';
import { BinarySimulationMove } from '../chessnavigation/SimulationMove';

export interface IBinarySimulator {
    movesGenerator(isBlack: boolean): BinarySimulationMove[];
    moveSimulator(move: BinarySimulationMove): void;
    scoreGetter(isBlack: boolean): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: BinaryChessCoreState): void;
    saveGameState(): BinaryChessCoreState;
    kingIsInDanger(isBlack: boolean): boolean;
    hasKing(isBlack: boolean): boolean;
}
export class BinaryMinimaxNode
{
    private move: BinarySimulationMove;
    private score: number;
    private electedChild: BinaryMinimaxNode = null;
    private alpha = Number.MIN_SAFE_INTEGER;
    private beta = Number.MAX_SAFE_INTEGER;
    private isMax = true;
    // https://youtu.be/xBXHtz4Gbdo
    // https://www.mygreatlearning.com/blog/alpha-beta-pruning-in-ai/
    // https://mathspp.com/blog/minimax-algorithm-and-alpha-beta-pruning
    constructor(currentMove: BinarySimulationMove, simulator: IBinarySimulator, isBlack: boolean, step: number, parent: BinaryMinimaxNode)
    {
        this.move = currentMove;
        this.isMax = isBlack;
        let gameState: BinaryChessCoreState = null;
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
        const moves = simulator.movesGenerator(isBlack);
        if (simulator.gameIsNotOver() && step > 0  && moves.length > 0)
        {
            const childStep = --step;
            for (const value of moves)
            {
                const child = new BinaryMinimaxNode(value, simulator, !isBlack, childStep , this);
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
            this.score = simulator.scoreGetter(isBlack);
            if (simulator.hasKing(isBlack) && simulator.kingIsInDanger(isBlack))
            {
                if (isBlack)
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
            this.score = simulator.scoreGetter(isBlack);
        }
        if (gameState !== null)
        {
            simulator.restoreGameState(gameState);
        }
    }
    public getElectedMove(): BinarySimulationMove
    {
        if (this.electedChild !== null)
        {
            return this.electedChild.move;
        }
        return null;
    }
}
