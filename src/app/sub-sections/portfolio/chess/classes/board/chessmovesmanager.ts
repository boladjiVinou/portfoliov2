import { ChessCase, ICaseBoardPosition } from './chessCase';
import { ChessPiece } from '../pieces/chesspiece';
import { KingPiece } from '../pieces/kingpiece';
import { PawnPiece } from '../pieces/pawnpiece';

export interface IPiecesRequestSupplier
{
    positionOccupiedByOpponent(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    caseIsEmpty(position: ICaseBoardPosition): boolean;
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void;
}
export interface IKingSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    canMakeAQueenCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    getKingCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition;
    getQueenCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition;
}
export interface IPawnSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canDoEnPassantMove(pawn: NonNullable<PawnPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
}
export class ChessNavigationManager implements IPiecesRequestSupplier, IKingSpecialRequestSupplier, IPawnSpecialRequestSupplier
{
    private chessBoard: Readonly<ChessCase[][]>;
    constructor(board: Readonly<ChessCase[][]>)
    {
        this.chessBoard = board;
    }
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void
    {
        this.chessBoard[position.I][position.J].setIsAvailable(isAvailable);
    }
    canDoEnPassantMove(pawn: PawnPiece, position: ICaseBoardPosition): boolean
    {
        const visitor = this.chessBoard[position.I][position.J].getVisitor();
        if (visitor instanceof PawnPiece)
        {
            return !(visitor as PawnPiece).isFriendWith(pawn) && (visitor as PawnPiece).getHasMovedTwoSquares();
        }
        else
        {
            return false;
        }
    }
    getKingCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition
    {
        throw new Error('Method not implemented.');
    }
    getQueenCastlingPosition(king: NonNullable<KingPiece>): ICaseBoardPosition
    {
        throw new Error('Method not implemented.');
    }
    canMakeAQueenCastle(king: NonNullable<KingPiece>, position: ICaseBoardPosition): boolean
    {
        return false;
    }
    canMakeAKingCastle(king: NonNullable<KingPiece>, position: NonNullable<ICaseBoardPosition>): boolean
    {
        return false;
    }
    caseIsEmpty(position: ICaseBoardPosition)
    {
        return this.chessBoard[position.I][position.J].isEmpty();
    }
    positionOccupiedByOpponent(piece: ChessPiece, position: NonNullable<ICaseBoardPosition>): boolean
    {
        const chessCase = this.chessBoard[position.I][position.J];
        if (!chessCase.isEmpty())
        {
            return (chessCase.getVisitor() as ChessPiece).isFriendWith(piece);
        }
        else
        {
            return false;
        }
    }
}
