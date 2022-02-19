import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeMaster } from '../chessnavigation/chessnodemaster';
import { PieceColor } from '../pieces/chesspiece';

export interface Simulator
{
    movesGenerator(color: PieceColor): [ICaseBoardPosition, ChessNodeMaster][];
    moveSimulator(position: ICaseBoardPosition, master: ChessNodeMaster): void;
    previousMoveCanceller(): void;
    scoreGetter(): number;
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
        if (this.move !== null)
        {
            simulator.moveSimulator(this.move[0], this.move[1]);
        }
        if (step > 0)
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
        if (this.move !== null)
        {
            simulator.previousMoveCanceller();
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
        return this.electedChild.move;
    }
}
