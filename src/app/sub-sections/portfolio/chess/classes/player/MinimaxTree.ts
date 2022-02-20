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
    private children: MinimaxTreeNode[] = [];
    private move: [ICaseBoardPosition, ChessNodeMaster];
    private score: number;
    private electedChild: MinimaxTreeNode;
    constructor(currentMove: [ICaseBoardPosition, ChessNodeMaster], simulator: Simulator, color: PieceColor, step: number, isMax: boolean)
    {
        this.move = currentMove;
        let gameState: ChessNodeState[] = [];
        if (this.move !== null)
        {
            gameState = simulator.saveGameState();
            simulator.moveSimulator(this.move[0], this.move[1]);
        }
        if (simulator.gameIsNotOver() && step > 0)
        {
            const nextColor = this.getOpponentColor(color);
            simulator.movesGenerator(color).forEach((value: [ICaseBoardPosition, ChessNodeMaster]) =>
                {
                    const child = new MinimaxTreeNode(value, simulator, nextColor, --step, !isMax);
                    this.appendChild(child);
                });
            this.score = this.children[0].getValue();
            this.electedChild = this.children[0];
            if (isMax)
            {
                this.children.forEach(child => {
                    if (child.getValue() > this.score)
                    {
                        this.score = child.getValue();
                        this.electedChild = child;
                    }
                });
            }
            else
            {
                this.children.forEach(child => {
                    if (child.getValue() < this.score)
                    {
                        this.score = child.getValue();
                        this.electedChild = child;
                    }
                });
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
    private appendChild(child: MinimaxTreeNode): void
    {
        this.children.push(child);
    }
    private getValue(): number
    {
        return this.score;
    }
    public getElectedMove(): [ICaseBoardPosition, ChessNodeMaster]
    {
        console.log('score ', this.score);
        return this.electedChild.move;
    }
}
