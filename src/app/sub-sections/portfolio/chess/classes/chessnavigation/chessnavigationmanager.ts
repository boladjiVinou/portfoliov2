import { ChessCase } from '../board/chessCase';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessPiece } from '../pieces/chesspiece';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { KingPiece } from '../pieces/kingpiece';
import { PawnPiece } from '../pieces/pawnpiece';
import { ChessBoard } from '../board/chessboard';
import { ChessNodeProvider } from './chessnodeprovider';
import { KingNodeMaster } from './kingnodemaster';
import { TransformablePawnPiece } from '../pieces/transformablePawnPiece';
import { BishopNodeMaster } from './bishopnodemaster';
import { ChessNodeMaster } from './chessnodemaster';
import { QueenNodeMaster } from './queennodemaster';
import { RookNodeMaster } from './rooknodemaster';
import { KnightNodeMaster } from './knightNodeMaster';
import { ChessMovePositions } from './chessMovePositions';
import { PieceAbstraction } from './pieceabstraction';

export interface IPiecesRequestSupplier
{
    positionOccupiedByOpponent(piece: NonNullable<ChessPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    caseIsEmpty(position: ICaseBoardPosition): boolean;
    setCaseAvailability(isAvailable: boolean , position: ICaseBoardPosition): void;
    showIsInDanger(isInDanger: boolean, position: ICaseBoardPosition): void;
    getPossibleDestinations(position: ICaseBoardPosition): ICaseBoardPosition[];
    notifyMove(piece: ChessPiece, newPosition: ICaseBoardPosition): void;
    realizeCapture(piece: ChessPiece, position: ICaseBoardPosition): void;
}
export interface IKingSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canMakeALeftCastling(king: NonNullable<KingPiece>): boolean;
    canMakeARightCastling(king: NonNullable<KingPiece>): boolean;
    realizeAnimatedRookLeftCastling(color: PieceColor): Promise<void>;
    realizeAnimatedRookRightCastling(color: PieceColor): Promise<void>;
}
export interface IPawnSpecialRequestSupplier extends IPiecesRequestSupplier
{
    canDoEnPassantCapture(pawn: NonNullable<PawnPiece>, position: NonNullable<ICaseBoardPosition>): boolean;
    notifyPromotion(pawn: NonNullable<TransformablePawnPiece>, newType: PieceType): void;
}
export interface IGameRequestSupplier
{
    kingIsInCheck(kingColor: PieceColor): boolean;
    getProvider(): Readonly<ChessNodeProvider>;
    realizeMove(targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition): Promise<void>;
    playerHasSomethingToDo(color: PieceColor): boolean;
    getKingCase(color: PieceColor): Readonly<ChessCase>;
    getPreviousMove(): ChessMovePositions;
    getBoardSummary(): PieceAbstraction[];
}

export class ChessNavigationManager implements IPiecesRequestSupplier, IKingSpecialRequestSupplier, IPawnSpecialRequestSupplier, IGameRequestSupplier
{
    private chessBoard: Readonly<ChessCase[][]>;
    private fullBoard: Readonly<ChessBoard>;
    private chessNodeProvider: ChessNodeProvider;
    private lastMoveDone: ChessMovePositions;
    constructor(board: Readonly<ChessBoard>)
    {
        this.chessBoard = board.getBoard();
        this.fullBoard = board;
        this.chessNodeProvider = new ChessNodeProvider();
        this.chessNodeProvider.initWithoutPiece(); // initFromPieces(this.fullBoard.getPieces());
    }
    showIsInDanger(isInDanger: boolean, position: ICaseBoardPosition): void {
        this.chessBoard[position.I][position.J].showIsInDanger(isInDanger);
    }
    getBoardSummary(): PieceAbstraction[]
    {
        return this.chessNodeProvider.getMastersSummary();
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
    playerHasSomethingToDo(color: PieceColor): boolean {
        return this.chessNodeProvider.playerHasAMoveToDo(color);
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
                }, 700);
            });
        });
    }
    getProvider(): Readonly<ChessNodeProvider>
    {
        return this.chessNodeProvider;
    }
    getPreviousMove(): ChessMovePositions
    {
        return this.lastMoveDone;
    }
    notifyPromotion(pawn: NonNullable<TransformablePawnPiece>, newType: PieceType): void
    {
        const position = pawn.getCurrentCase().getCasePosition();
        const oldMaster = this.chessNodeProvider.getNode(position).getOwner();
        let master: ChessNodeMaster;
        switch (newType)
        {
            case PieceType.BISHOP:
                master = new BishopNodeMaster(pawn.getColor());
                break;
            case PieceType.QUEEN:
                master = new QueenNodeMaster(pawn.getColor());
                break;
            case PieceType.ROOK:
                master = new RookNodeMaster(pawn.getColor());
                break;
            case PieceType.KNIGHT:
                master = new KnightNodeMaster(pawn.getColor());
                break;
        }
        master.setHasMoved(true);
        master.setOriginalPosition(oldMaster.getOriginalPosition());
        master.setNodeProvider(this.chessNodeProvider);
        this.chessNodeProvider.insertNewMaster(master);
        this.chessNodeProvider.setMasterAndUpdateBoard(position, master);
    }
    notifyMove(piece: ChessPiece, newPosition: ICaseBoardPosition): void
    {
       const quittingNode = this.chessNodeProvider.getNode(piece.getCurrentCase().getCasePosition());
       const oldPos = piece.getCurrentCase().getCasePosition();
       const master = quittingNode.getOwner();
       const receivingNode = this.chessNodeProvider.getNode(newPosition);
       this.chessNodeProvider.setMasterAndUpdateBoard(receivingNode.getPosition(), master);
       this.lastMoveDone = new ChessMovePositions( {I: oldPos.I, J: oldPos.J}, {I: newPosition.I, J: newPosition.J});
    }
    getPossibleDestinations(position: ICaseBoardPosition): ICaseBoardPosition[]
    {
        return this.chessNodeProvider.getNode(position).getOutnodePosition();
    }

    kingIsInCheck(kingColor: PieceColor): boolean
    {
        return this.chessNodeProvider.kingIsInDanger(kingColor);
    }
    realizeCapture(piece: ChessPiece, position: ICaseBoardPosition): void
    {
        const prisonner = this.chessBoard[position.I][position.J].getVisitor();
        if (prisonner !== null && prisonner !== undefined)
        {
            piece.getOwner().capture(prisonner as ChessPiece);
            this.chessNodeProvider.setMasterAndUpdateBoard(position, null);
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
        return this.chessNodeProvider.canDoEnpassantCapture(pawn.getCurrentCase().getCasePosition(), position);
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
        const position = king.getCurrentCase().getCasePosition();
        return this.chessNodeProvider.canMakeARightCastling(this.chessNodeProvider.getNode(position).getOwner() as KingNodeMaster);
    }
    canMakeALeftCastling(king: NonNullable<KingPiece>): boolean
    {
        const position = king.getCurrentCase().getCasePosition();
        return this.chessNodeProvider.canMakeALeftCastling(this.chessNodeProvider.getNode(position).getOwner() as KingNodeMaster);
    }

    positionEquals(p1: ICaseBoardPosition, p2: ICaseBoardPosition): boolean
    {
        return p1.I === p2.I && p1.J === p2.J;
    }
    caseIsEmpty(position: ICaseBoardPosition)
    {
        return this.chessNodeProvider.getNode(position).isFree();
    }
    positionOccupiedByOpponent(piece: ChessPiece, position: NonNullable<ICaseBoardPosition>): boolean
    {
        return this.chessNodeProvider.getNode(position).isOccupiedByOpponent(piece.getColor());
    }
}
