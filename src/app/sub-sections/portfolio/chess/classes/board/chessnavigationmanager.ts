import { ChessCase, ICaseBoardPosition, ICaseVisitor } from './chessCase';
import { ChessPiece, PieceColor } from '../pieces/chesspiece';
import { KingPiece } from '../pieces/kingpiece';
import { PawnPiece } from '../pieces/pawnpiece';
import { ChessBoard } from './chessboard';
import { LiteChessBoard } from './litechessboard';

export interface IPiecesRequestSupplier
{
    positionOccupiedByOpponent(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    caseIsEmpty(position: ICaseBoardPosition): boolean;
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void;
    kingisInCheckAfterThisMove(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
}
export interface IKingSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canMakeALeftCastling(king: NonNullable<KingPiece>): boolean;
    canMakeARightCastling(king: NonNullable<KingPiece>): boolean;
    realizeAnimatedRookLeftCastling(color: PieceColor): Promise<void>;
    realizeAnimatedRookRightCastling(color: PieceColor): Promise<void>;
    realizeRookLeftCastling(color: PieceColor): void;
    realizeRookRightCastling(color: PieceColor): void;
}
export interface IPawnSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canDoEnPassantCapture(pawn: NonNullable<PawnPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    realizeEnPassantCapture(pawn: NonNullable<PawnPiece>, position: NonNullable<ICaseBoardPosition>): void;
}
export interface IGameRequestSupplier
{
    kingIsInCheck(kingColor: PieceColor): boolean;
}

export class ChessNavigationManager implements IPiecesRequestSupplier, IKingSpecialRequestSupplier, IPawnSpecialRequestSupplier, IGameRequestSupplier
{
    private chessBoard: Readonly<ChessCase[][]>;
    private fullBoard: Readonly<ChessBoard>;
    constructor(board: Readonly<ChessBoard>)
    {
        this.chessBoard = board.getBoard();
        this.fullBoard = board;
    }

    kingIsInCheck(kingColor: PieceColor): boolean
    {
        const king = (kingColor === PieceColor.WHITE) ? this.fullBoard.getWhiteKing() : this.fullBoard.getBlackKing();
        const opponentColor = (kingColor === PieceColor.WHITE) ? PieceColor.BLACK : PieceColor.WHITE;
        const opponentDestinations: ICaseBoardPosition[] = [].concat(...this.fullBoard.getPieces().filter( piece => piece.hasColor(opponentColor) && piece.isVisible()).map(piece => piece.getPossibleDestinations()));
        const kingPosition = king.getCurrentCase().getCasePosition();
        return opponentDestinations.some( position => position.I === kingPosition.I && position.J === kingPosition.J);
    }
    realizeEnPassantCapture(pawn: PawnPiece, position: ICaseBoardPosition): void
    {
        const prisonner = this.chessBoard[position.I][position.J].getVisitor();
        if (prisonner !== null && prisonner !== undefined)
        {
            pawn.getOwner().capture(prisonner as ChessPiece);
        }
    }
    realizeRookLeftCastling(color: PieceColor): void {
        if (color === PieceColor.BLACK)
        {
            this.chessBoard[0][5].acceptVisitor(this.chessBoard[0][7].getVisitor());
        }
        else
        {
            this.chessBoard[7][3].acceptVisitor(this.chessBoard[7][0].getVisitor());
        }
    }
    realizeRookRightCastling(color: PieceColor): void {
        if (color === PieceColor.BLACK)
        {
            this.chessBoard[0][3].acceptVisitor(this.chessBoard[0][0].getVisitor());
        }
        else
        {
            this.chessBoard[7][5].acceptVisitor(this.chessBoard[7][7].getVisitor());
        }
    }
    realizeAnimatedRookLeftCastling(color: PieceColor): Promise<void>
    {
        if (color === PieceColor.BLACK)
        {
            return this.chessBoard[0][5].animatedAccept(this.chessBoard[0][7].getVisitor());
        }
        else
        {
            return this.chessBoard[7][3].animatedAccept(this.chessBoard[7][0].getVisitor());
        }
    }
    realizeAnimatedRookRightCastling(color: PieceColor): Promise<void>
    {
        if (color === PieceColor.BLACK)
        {
            return this.chessBoard[0][3].animatedAccept(this.chessBoard[0][0].getVisitor());
        }
        else
        {
            return this.chessBoard[7][5].animatedAccept(this.chessBoard[7][7].getVisitor());
        }
    }
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void
    {
        this.chessBoard[position.I][position.J].setIsAvailable(isAvailable);
    }
    canDoEnPassantCapture(pawn: PawnPiece, position: ICaseBoardPosition): boolean
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
    /*
     * castling rules
     * The king has not previously moved;
       Your chosen rook has not previously moved;
       There must be no pieces between the king and the chosen rook;
       The king is not currently in check;
       Your king must not pass through a square that is under attack by enemy pieces;
       The king must not end up in check
     */
    canMakeARightCastling(king: NonNullable<KingPiece>): boolean
    {
        if (king.hasColor(PieceColor.BLACK))
        {
            const rook = this.fullBoard.getRightBlackRook();
            if (!king.getHasMovedOnce() && !rook.getHasMovedOnce() && this.chessBoard[0][1].isEmpty() && this.chessBoard[0][2].isEmpty() && this.chessBoard[0][3].isEmpty())
            {
                const opponentDestinations: ICaseBoardPosition[] = [].concat(...this.fullBoard.getPieces().filter( piece => piece.hasColor(PieceColor.WHITE) && piece.isVisible()).map(piece => piece.getPossibleDestinations()));
                return !opponentDestinations.some(destination => this.positionEquals(destination, {I: 0, J: 4})) && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 0, J: 3})) && //
                 !opponentDestinations.some(destination => this.positionEquals(destination , {I: 0, J: 2})) && !opponentDestinations.some(destination => this.positionEquals(destination ,  {I: 0, J: 1}));
            }
        }
        else
        {
            const rook = this.fullBoard.getRightWhiteRook();
            if (!king.getHasMovedOnce() && !rook.getHasMovedOnce() && this.chessBoard[7][6].isEmpty() && this.chessBoard[7][5].isEmpty())
            {
                const opponentDestinations: ICaseBoardPosition[] = [].concat(...this.fullBoard.getPieces().filter( piece => piece.hasColor(PieceColor.BLACK) && piece.isVisible()).map(piece => piece.getPossibleDestinations()));
                return !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 4})) && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 5})) //
                && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 6}));
            }
        }
        return false;
    }
    canMakeALeftCastling(king: NonNullable<KingPiece>): boolean
    {
        if (king.hasColor(PieceColor.BLACK))
        {
            const rook = this.fullBoard.getLeftBlackRook();
            if (!king.getHasMovedOnce() && !rook.getHasMovedOnce() && this.chessBoard[0][6].isEmpty() && this.chessBoard[0][5].isEmpty())
            {
                const opponentDestinations: ICaseBoardPosition[] = [].concat(...this.fullBoard.getPieces().filter( piece => piece.hasColor(PieceColor.WHITE) && piece.isVisible()).map(piece => piece.getPossibleDestinations()));
                return !opponentDestinations.some(destination => this.positionEquals(destination , {I: 0, J: 4})) && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 0, J: 5})) //
                && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 0, J: 6}));
            }
        }
        else
        {
            const rook = this.fullBoard.getLeftWhiteRook();
            if (!king.getHasMovedOnce() && !rook.getHasMovedOnce() && this.chessBoard[7][1].isEmpty() && this.chessBoard[7][2].isEmpty() && this.chessBoard[7][3].isEmpty())
            {
                const opponentDestinations: ICaseBoardPosition[] = [].concat(...this.fullBoard.getPieces().filter( piece => piece.hasColor(PieceColor.BLACK) && piece.isVisible()).map(piece => piece.getPossibleDestinations()));
                return !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 4})) && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 3})) && //
                        !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 2}))  && !opponentDestinations.some(destination => this.positionEquals(destination , {I: 7, J: 1}));
            }
        }
        return false;
    }

    positionEquals(p1: ICaseBoardPosition, p2: ICaseBoardPosition): boolean
    {
        return p1.I === p2.I && p1.J === p2.J;
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
            return !(chessCase.getVisitor() as ChessPiece).isFriendWith(piece);
        }
        else
        {
            return false;
        }
    }

    kingisInCheckAfterThisMove(piece: ChessPiece, wantedPosition: ICaseBoardPosition): boolean
    {
        const liteBoard = new LiteChessBoard(this.fullBoard);
        const piecePosition = piece.getCurrentCase().getCasePosition();
        const litePiece = liteBoard.getPiece(piecePosition);
        liteBoard.setPiece(piecePosition, null);
        liteBoard.setPiece(wantedPosition, litePiece);
        const color = litePiece.getColor();

        const king = (color === PieceColor.WHITE) ? liteBoard.getWhiteKing() : liteBoard.getBlackKing();
        const opponentColor = (color === PieceColor.WHITE) ? PieceColor.BLACK : PieceColor.WHITE;
        const opponentDestinations: ICaseBoardPosition[] = [].concat(...liteBoard.getPieces()//
                                .filter( tmpPiece => tmpPiece.hasSameColor(opponentColor)).map(tmpPiece => tmpPiece.getPossiblePositionsWithThisBoard(liteBoard)));
        const kingPosition = liteBoard.getPosition(king);

        return opponentDestinations.some( position => position.I === kingPosition.I && position.J === kingPosition.J);
    }
}
