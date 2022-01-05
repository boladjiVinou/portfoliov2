import { ChessCase, ICaseBoardPosition } from './chessCase';
import { ChessPiece } from './pieces/chesspiece';
import { KingPiece } from './pieces/kingpiece';

export interface IPiecesRequestSupplier
{
    canMoveTo(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    positionOccupiedByOpponent(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    caseIsEmpty( position: ICaseBoardPosition);
}
export interface IKingSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    canMakeAQueenCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    getKingCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition;
    getQueenCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition;
}
export class ChessNavigationManager implements IPiecesRequestSupplier, IKingSpecialRequestSupplier
{
    private chessBoard: ChessCase[][];
    constructor(board: ChessCase[][])
    {
        this.chessBoard = board;
    }
    getKingCastlingPosition(king: KingPiece): ICaseBoardPosition {
        throw new Error('Method not implemented.');
    }
    getQueenCastlingPosition(king: KingPiece): ICaseBoardPosition {
        throw new Error('Method not implemented.');
    }
    canMakeAQueenCastle(king: KingPiece, position: ICaseBoardPosition): boolean {
        throw new Error('Method not implemented.');
    }
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
    caseIsEmpty(position: ICaseBoardPosition) {
        throw new Error('Method not implemented.');
    }
    positionOccupiedByOpponent(piece: ChessPiece, position: NonNullable<ICaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
    canMoveTo(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
}
