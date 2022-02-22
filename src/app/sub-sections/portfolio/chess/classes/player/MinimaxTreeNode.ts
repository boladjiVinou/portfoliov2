import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeState } from '../chessnavigation/chessnode';
import { ChessNodeMaster } from '../chessnavigation/chessnodemaster';
import { PieceColor } from '../pieces/chesspiece';

export interface Simulator
{
    movesGenerator(color: PieceColor): [ICaseBoardPosition, ChessNodeMaster][];
    moveSimulator(position: ICaseBoardPosition, master: ChessNodeMaster): void;
    scoreGetter(): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: ChessNodeState[]): void;
    saveGameState(): ChessNodeState[];
}
export class MinimaxTreeNode
{
    private move: [ICaseBoardPosition, ChessNodeMaster];
    private score: number;
    private electedChild: MinimaxTreeNode;
    private alpha = Number.MIN_SAFE_INTEGER;
    private beta = Number.MAX_SAFE_INTEGER;
    private isMax = true;
    // https://youtu.be/xBXHtz4Gbdo
    // https://www.mygreatlearning.com/blog/alpha-beta-pruning-in-ai/
    constructor(currentMove: [ICaseBoardPosition, ChessNodeMaster], simulator: Simulator, color: PieceColor, step: number, parent: MinimaxTreeNode)
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
            simulator.moveSimulator(this.move[0], this.move[1]);
        }
        if (simulator.gameIsNotOver() && step > 0 )
        {
            const nextColor = this.getOpponentColor(color);
            const childStep = --step;
            for (const value of simulator.movesGenerator(color))
            {
                const child = new MinimaxTreeNode(value, simulator, nextColor, childStep , this);
                if (this.isMax && this.score < child.score)
                {
                    this.score = child.score;
                    this.alpha = child.score;
                    this.electedChild = child;
                }
                else if (!this.isMax && this.score > child.score)
                {
                    this.score = child.score;
                    this.beta = child.score;
                    this.electedChild = child;
                }
                if (this.alpha >= this.beta)
                {
                    break;
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
    public getElectedMove(): [ICaseBoardPosition, ChessNodeMaster]
    {
        return this.electedChild.move;
    }
}

export class MinimaxNodeRequirement
{
    currentMove: [ICaseBoardPosition, ChessNodeMaster];
    simulator: Simulator;
    color: PieceColor;
    step: number;
    isMax: boolean;
    parentCurrentScore: number;
    constructor(currentMove: [ICaseBoardPosition, ChessNodeMaster], simulator: Simulator, color: PieceColor, step: number, isMax: boolean, parentCurrentScore: number)
    {
        this.currentMove = currentMove;
        this.simulator = simulator;
        this.color = color;
        this.step = step;
        this.isMax = isMax;
        this.parentCurrentScore = parentCurrentScore;
    }
}
