import { CaseBoardPosition } from './chessCase';
import { ChessPiece } from './pieces/chesspiece';
import { KingPiece } from './pieces/kingpiece';

export interface PiecesChessManager
{
    canMoveTo(piece: NonNullable<ChessPiece>, position: NonNullable<CaseBoardPosition>): boolean;
    positionOccupiedByOpponent(piece: NonNullable<ChessPiece>, position: NonNullable<CaseBoardPosition>): boolean;
    caseIsEmpty( position: CaseBoardPosition);
}
export interface KingSpecialRequestSupplier
{
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<CaseBoardPosition>): boolean;
    canMakeAQueenCastle(king: NonNullable<KingPiece>, position: NonNullable<CaseBoardPosition>): boolean;
    getKingCastlingPosition(king: NonNullable<KingPiece>): CaseBoardPosition;
    getQueenCastlingPosition(king: NonNullable<KingPiece>): CaseBoardPosition;
}
export class ChessManager implements PiecesChessManager, KingSpecialRequestSupplier
{
    getKingCastlingPosition(king: KingPiece): CaseBoardPosition {
        throw new Error('Method not implemented.');
    }
    getQueenCastlingPosition(king: KingPiece): CaseBoardPosition {
        throw new Error('Method not implemented.');
    }
    canMakeAQueenCastle(king: KingPiece, position: CaseBoardPosition): boolean {
        throw new Error('Method not implemented.');
    }
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<CaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
    caseIsEmpty(position: CaseBoardPosition) {
        throw new Error('Method not implemented.');
    }
    positionOccupiedByOpponent(piece: ChessPiece, position: NonNullable<CaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
    canMoveTo(piece: NonNullable<ChessPiece>, position: NonNullable<CaseBoardPosition>): boolean {
        throw new Error('Method not implemented.');
    }
}
