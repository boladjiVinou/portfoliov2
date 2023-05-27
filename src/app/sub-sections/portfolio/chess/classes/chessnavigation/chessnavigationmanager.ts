import { ChessCase } from '../board/chessCase';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessPiece } from '../pieces/chesspiece';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { KingPiece } from '../pieces/kingpiece';
import { PawnPiece } from '../pieces/pawnpiece';
import { ChessBoard } from '../board/chessboard';
import { TransformablePawnPiece } from '../pieces/transformablePawnPiece';
import { IChessCoreAdapter, MoveData } from './IChessCoreAdapter';
import { ChessThreadAdapter } from '../multithreading/chessThreadAdapter';
import { ChessCoreAdapter } from './chesscoreadapter';

export interface IPiecesRequestSupplier
{
    caseIsEmpty(position: ICaseBoardPosition): boolean;
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void;
    showIsInDanger(isInDanger: boolean, position: ICaseBoardPosition): void;
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>;
    notifyMove(piece: ChessPiece, newPosition: ICaseBoardPosition): Promise<void>;
    realizeCapture(piece: ChessPiece, position: ICaseBoardPosition): Promise<void>;
}
export interface IKingSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canMakeALeftCastling(king: NonNullable<KingPiece>): Promise<boolean>;
    canMakeARightCastling(king: NonNullable<KingPiece>): Promise<boolean>;
    realizeAnimatedRookLeftCastling(color: PieceColor): Promise<void>;
    realizeAnimatedRookRightCastling(color: PieceColor): Promise<void>;
}
export interface IPawnSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canDoEnPassantCapture(pawn: NonNullable<PawnPiece>, position: NonNullable<ICaseBoardPosition>): Promise<boolean>;
    notifyPromotion(pawn: NonNullable<TransformablePawnPiece>, newType: PieceType): Promise<void>;
}
export interface IPlayerRequestSupplier
{
    realizeMove(targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition): Promise<void>;
    getBestMovePossible(color: PieceColor): Promise<MoveData>;
}
export interface IGameRequestSupplier extends IPlayerRequestSupplier
{
    kingIsInCheck(kingColor: PieceColor): Promise<boolean>;
    playerHasSomethingToDo(color: PieceColor): Promise<boolean>;
    getKingCase(color: PieceColor): Readonly<ChessCase>;
    initCore(heavyProcesingNotifyer: (isProcessing: boolean) => void): Promise<void>;
    killCore(): Promise<void>;
}


export class ChessNavigationManager implements IPiecesRequestSupplier, IKingSpecialRequestSupplier, IPawnSpecialRequestSupplier, IGameRequestSupplier
{
    private chessBoard: Readonly<ChessCase[][]>;
    private fullBoard: Readonly<ChessBoard>;
    private chessCoreAdapter: IChessCoreAdapter;
    constructor(board: Readonly<ChessBoard>)
    {
        this.chessBoard = board.getBoard();
        this.fullBoard = board;
    }
    killCore(): Promise<void> {
        return this.chessCoreAdapter.killCore();
    }
    initCore(heavyProcesingNotifyer: (isProcessing: boolean) => void): Promise<void> {
        if (typeof(Worker) !== 'undefined')
        {
            this.chessCoreAdapter = new ChessThreadAdapter(heavyProcesingNotifyer);
        }
        else
        {
            this.chessCoreAdapter = new ChessCoreAdapter();
        }
        return this.chessCoreAdapter.initChessCore();
    }
    getBestMovePossible(color: PieceColor): Promise<MoveData> {
       return this.chessCoreAdapter.getBestMovePossible(color);
    }
    showIsInDanger(isInDanger: boolean, position: ICaseBoardPosition): void {
        this.chessBoard[position.I][position.J].showIsInDanger(isInDanger);
    }
    getKingCase(color: PieceColor): Readonly<ChessCase>
    {
        switch (color)
        {
            case PieceColor.BLACK:
                return this.fullBoard.getBlackKing().getCurrentCase();
            case PieceColor.WHITE:
               return this.fullBoard.getWhiteKing().getCurrentCase();
        }
    }
    playerHasSomethingToDo(color: PieceColor): Promise<boolean> {
        return this.chessCoreAdapter.playerHasAMoveToDo(color);
    }
    realizeMove(targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            this.chessBoard[targetPosition.I][targetPosition.J].showHighLight(true);
            this.chessBoard[currentPosition.I][currentPosition.J].showHighLight(true);
            this.chessBoard[targetPosition.I][targetPosition.J].animatedAccept(this.chessBoard[currentPosition.I][currentPosition.J].getVisitor()).then(() =>
            {
                setTimeout(() => {
                    this.chessBoard[targetPosition.I][targetPosition.J].showHighLight(false);
                    this.chessBoard[currentPosition.I][currentPosition.J].showHighLight(false);
                    resolve();
                    return;
                }, 700);
            });
        });
    }
    notifyPromotion(pawn: NonNullable<TransformablePawnPiece>, newType: PieceType): Promise<void>
    {
        return new Promise((resolve) =>
        {
            const position = pawn.getCurrentCase().getCasePosition();
            this.chessCoreAdapter.notifyPromotion(position, newType, pawn.getColor()).then(() =>
            {
                resolve();
                return;
            });
        });
    }
    notifyMove(piece: ChessPiece, newPosition: ICaseBoardPosition): Promise<void>
    {
       return  this.chessCoreAdapter.notifyMove(piece.getCurrentCase().getCasePosition(), newPosition);
    }
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>
    {
        return this.chessCoreAdapter.getPossibleDestinations(position);
    }

    kingIsInCheck(kingColor: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            this.chessCoreAdapter.kingIsInDanger(kingColor).then((result) =>
            {
                resolve(result);
                return;
            });
        });
    }
    realizeCapture(piece: ChessPiece, position: ICaseBoardPosition): Promise<void>
    {
        return new Promise((resolve) =>
        {
            const prisonner = this.chessBoard[position.I][position.J].getVisitor();
            if (prisonner !== null && prisonner !== undefined)
            {
                piece.getOwner().capture(prisonner as ChessPiece);
                this.chessCoreAdapter.capture(position).then(() =>
                {
                    resolve();
                    return;
                });
            }
            else
            {
                resolve();
                return;
            }
        });
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
    canDoEnPassantCapture(pawn: PawnPiece, position: ICaseBoardPosition): Promise<boolean>
    {
        return this.chessCoreAdapter.canDoEnPassantCapture(pawn.getCurrentCase().getCasePosition(), position);
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
    canMakeARightCastling(king: NonNullable<KingPiece>): Promise<boolean>
    {
        return this.chessCoreAdapter.canMakeRightCastling(king.getColor());
    }
    canMakeALeftCastling(king: NonNullable<KingPiece>): Promise<boolean>
    {
        return this.chessCoreAdapter.canMakeLeftCastling(king.getColor());
    }

    positionEquals(p1: ICaseBoardPosition, p2: ICaseBoardPosition): boolean
    {
        return p1.I === p2.I && p1.J === p2.J;
    }
    caseIsEmpty(position: ICaseBoardPosition): boolean
    {
        const visitor = this.chessBoard[position.I][position.J].getVisitor() ;
        return visitor === null || visitor === undefined;
    }
}
