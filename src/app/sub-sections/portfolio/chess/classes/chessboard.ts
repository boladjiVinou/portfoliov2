import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { BlackChessCase, ChessCase, WhiteChessCase } from './chessCase';
export class ChessBoard
{
    private board: ChessCase[][] = [];
    // green: y up, red: x to me, z: blue left
    public init(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            this.createCases();
            this.loadChessPieces().then(() =>
            {
                resolve();
                return;
            });
        });
    }

    private createCases(): void
    {
        const firstCase = new WhiteChessCase({I: 0, J: 0});
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
                    line.push(new WhiteChessCase({I: i, J: 0}));
                }
                else {
                    line.push(new BlackChessCase({I: i, J: 0}));
                }
            }
            this.setCasePosition(line[line.length - 1], i, 0);
            for (let j = 1; j < 8 ; ++j) {
                if (line[j - 1] instanceof WhiteChessCase) {
                    line.push(new BlackChessCase({I: i, J: j}));
                }
                else {
                    line.push(new WhiteChessCase({I: i, J: j}));
                }
                this.setCasePosition( line[line.length - 1], i, j);
            }
            this.board.push(line);
        }
    }

    private loadChessPieces(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            resolve();
            return;
        });
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
