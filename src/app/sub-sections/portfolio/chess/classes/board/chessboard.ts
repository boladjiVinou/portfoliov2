import * as THREE from 'three';
import { Color, Vector2, Vector3 } from 'three';
import { BlackChessCase, ChessCase, WhiteChessCase } from './chessCase';
import { BishopPiece } from '../pieces/bishoppiece';
import { ChessPiece, PieceColor } from '../pieces/chesspiece';
import { KingPiece } from '../pieces/kingpiece';
import { KnightPiece } from '../pieces/knightpiece';
import { PawnPiece } from '../pieces/pawnpiece';
import { QueenPiece } from '../pieces/queenpiece';
import { RookPiece } from '../pieces/rookpiece';
export class ChessBoard
{
    private board: ChessCase[][] = [];
    private pieces: ChessPiece[] = [];
    private whiteLeftRook: RookPiece;
    private whiteRightRook: RookPiece;
    private blackLeftRook: RookPiece;
    private blackRightRook: RookPiece;
    // green: y up, red: x to me, z: blue left
    public init(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            this.createCases();
            this.loadChessPieces().then(() =>
            {
                this.copyRooksReferences();
                resolve();
                return;
            });
        });
    }

    public getLeftBlackRook(): Readonly<RookPiece>
    {
        return this.blackLeftRook;
    }
    public getRightBlackRook(): Readonly<RookPiece>
    {
        return this.blackRightRook;
    }
    public getLeftWhiteRook(): Readonly<RookPiece>
    {
        return this.whiteLeftRook;
    }
    public getRightWhiteRook(): Readonly<RookPiece>
    {
        return this.whiteRightRook;
    }
    private copyRooksReferences()
    {
        this.whiteLeftRook = this.board[7][0].getVisitor() as RookPiece;
        this.whiteRightRook = this.board[7][7].getVisitor() as RookPiece;
        this.blackLeftRook = this.board[0][7].getVisitor() as RookPiece;
        this.blackRightRook = this.board[0][0].getVisitor() as RookPiece;
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
            const promises: Promise<void>[] = [];
            promises.push(this.initPawns(PieceColor.BLACK));
            promises.push(this.initPawns(PieceColor.WHITE));

            promises.push(this.initRooks(PieceColor.BLACK));
            promises.push(this.initRooks(PieceColor.WHITE));

            promises.push(this.initKnight(PieceColor.BLACK));
            promises.push(this.initKnight(PieceColor.WHITE));

            promises.push(this.initBishop(PieceColor.BLACK));
            promises.push(this.initBishop(PieceColor.WHITE));

            promises.push(this.initKing(PieceColor.BLACK));
            promises.push(this.initKing(PieceColor.WHITE));

            promises.push(this.initQueen(PieceColor.BLACK));
            promises.push(this.initQueen(PieceColor.WHITE));

            Promise.all(promises).then(() =>
            {
                resolve();
                return;
            });
        });
    }
    private initQueen(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                const queen = new QueenPiece(color);
                queen.init().then(() =>
                {
                    if (color === PieceColor.BLACK)
                    {
                        this.board[0][3].acceptVisitor(queen);
                    }
                    else
                    {
                        this.board[7][3].acceptVisitor(queen);
                    }
                    this.pieces.push(queen);
                    resolve();
                    return;
                });
            });
    }
    private initKing(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                const king = new KingPiece(color);
                king.init().then(() =>
                {
                    if (color === PieceColor.BLACK)
                    {
                        this.board[0][4].acceptVisitor(king);
                    }
                    else
                    {
                        this.board[7][4].acceptVisitor(king);
                    }
                    this.pieces.push(king);
                    resolve();
                    return;
                });
            });
    }
    private initBishop(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                let row = 7;
                if (color === PieceColor.BLACK)
                {
                    row = 0;
                }
                let col = 2;
                const bishopIniter = () =>
                {
                    const bishop = new BishopPiece(color);
                    bishop.init().then(() =>
                    {
                        this.board[row][col].acceptVisitor(bishop);
                        this.pieces.push(bishop);
                        if (col === 2)
                        {
                            col = 5;
                            bishopIniter();
                        }
                        else
                        {
                            resolve();
                            return;
                        }
                    });
                };
                bishopIniter();
            });
    }
    private initKnight(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                let row = 7;
                if (color === PieceColor.BLACK)
                {
                    row = 0;
                }
                let col = 1;
                const knightIniter = () =>
                {
                    const knight = new KnightPiece(color);
                    knight.init().then(() =>
                    {
                        this.board[row][col].acceptVisitor(knight);
                        this.pieces.push(knight);
                        if (col === 1)
                        {
                            col = 6;
                            knightIniter();
                        }
                        else
                        {
                            resolve();
                            return;
                        }
                    });
                };
                knightIniter();
            });
    }
    private initPawns(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
        {
            let row = 6;
            if (color === PieceColor.BLACK)
            {
                row = 1;
            }
            let i = 0;
            const pawnIniter = () =>
            {
                const pawn = new PawnPiece(color);
                pawn.init().then(() =>
                {
                    this.board[row][i].acceptVisitor(pawn);
                    this.pieces.push(pawn);
                    ++i;
                    if (i < 8)
                    {
                        pawnIniter();
                    }
                    else
                    {
                        resolve();
                        return;
                    }
                });
            };
            pawnIniter();
        });
    }

    private initRooks(color: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                let row = 7;
                if (color === PieceColor.BLACK)
                {
                    row = 0;
                }
                let col = 0;
                const rookIniter = () =>
                {
                    const rook = new RookPiece(color);
                    rook.init().then(() =>
                    {
                        this.board[row][col].acceptVisitor(rook);
                        this.pieces.push(rook);
                        if (col === 0)
                        {
                            col = 7;
                            rookIniter();
                        }
                        else
                        {
                            resolve();
                            return;
                        }
                    });
                };
                rookIniter();
            });
    }

    private setCasePosition(chessCase: ChessCase, line: number, column: number): void
    {
        // + 0.25 just to view case borders
        chessCase.position.setZ(((ChessCase.depth) * (4 - column)) - (ChessCase.depth / 2));
        chessCase.position.setX((ChessCase.width) * (line - 4));
        chessCase.position.setY(1550);
    }

    public getBoard(): Readonly<ChessCase[][]>
    {
        return this.board;
    }
    public getPieces(): Readonly<ChessPiece[]>
    {
        return this.pieces;
    }
}
