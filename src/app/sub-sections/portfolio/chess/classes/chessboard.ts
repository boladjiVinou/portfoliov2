import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { BlackChessCase, ChessCase, WhiteChessCase } from './chessCase';
export class ChessBoard
{
    private board: ChessCase[][] = [];
    // green: y up, red: x to me, z: blue left
    constructor() {
        const firstCase = new WhiteChessCase();
        for (let i = 0; i < 8 ; ++i)
        {
            const line: ChessCase[] = [];
            if (this.board.length === 0)
            {
                line.push(firstCase);
            }
            else
            {
                if (this.board[i - 1][7] instanceof WhiteChessCase) {
                    line.push(new WhiteChessCase());
                }
                else {
                    line.push(new BlackChessCase());
                }
            }
            this.setCasePosition(line[line.length - 1], i, 0);
            for (let j = 1; j < 8 ; ++j) {
                if (line[j - 1] instanceof WhiteChessCase) {
                    line.push(new BlackChessCase());
                }
                else {
                    line.push(new WhiteChessCase());
                }
                this.setCasePosition( line[line.length - 1], i, j);
            }
            this.board.push(line);
        }
    }

    private setCasePosition(chessCase: ChessCase, line: number, column: number): void
    {
        chessCase.position.setZ(((ChessCase.depth) * (4 - column)) - ChessCase.depth / 2);
        chessCase.position.setX((ChessCase.width) * (line - 4));
        chessCase.position.setY(1550);
    }

    public getBoard(): ChessCase[][]
    {
        return this.board;
    }
}
