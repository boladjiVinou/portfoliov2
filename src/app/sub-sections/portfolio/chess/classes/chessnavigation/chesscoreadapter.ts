import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { BinaryChessCore } from './binaryChessCore';
import { ChessCore } from './chessCore';
import { ChessMovePositions } from './chessMovePositions';
import { IChessCoreAdapter, MoveData } from './IChessCoreAdapter';
import { KingNodeMaster } from './kingnodemaster';
import { PawnSimulationMove } from './PawnSimulationMove';

export class ChessCoreAdapter implements IChessCoreAdapter
{
    private chessCore: BinaryChessCore; // : ChessCore = null;
    initChessCore(): Promise<void> {
        return new Promise((resolve) =>
        {
            this.chessCore =  new BinaryChessCore();
            /// this.chessCore.initWithoutPiece();
            resolve();
            return;
        });
    }
    playerHasAMoveToDo(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.playerHasAMoveToDo(color));
            return;
        });
    }
    notifyPromotion(pawnPosition: ICaseBoardPosition, newType: PieceType, pawnColor: PieceColor): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessCore.notifyPromotion(pawnPosition, newType);
            resolve();
            return;
        });
    }
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>
    {
        return new Promise((resolve) =>
        {
            const possiblePositions = this.chessCore.getPossibleDestinations(position); // .getNode(position).getOutnodePosition();
            resolve(possiblePositions);
            return;
        });
    }
    kingIsInDanger(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.kingIsInDanger(color === PieceColor.BLACK));
            return;
        });
    }
    capture(position: ICaseBoardPosition): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessCore.capture(position); // .setMasterAndUpdateBoard(position, null);
            resolve();
        });
    }
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.canDoEnPassantCapture(source, dest)/*.canDoEnpassantCapture(source, dest)*/);
            return;
        });
    }
    caseIsEmpty(position: ICaseBoardPosition): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.caseIsEmpty(position)/*.getNode(position).isFree()*/);
            return;
        });
    }
    caseOccupiedByOpponent(position: ICaseBoardPosition, color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.caseOccupiedByOpponent(position, color)/*.getNode(position).isOccupiedByOpponent(color)*/);
            return;
        });
    }
    getBestMovePossible(color: PieceColor): Promise<MoveData>
    {
        return new Promise((resolve) =>
        {
           /* const choosenMove = this.chessCore.getBestMovePossible(color);
            let pawnPromotionType: PieceType = null;
            if (choosenMove instanceof PawnSimulationMove && choosenMove.hasPromotionType())
            {
                pawnPromotionType = choosenMove.getPromotionType();
            }
            const oldPosition = this.chessCore.getNodeOf(choosenMove.getMaster()).getPosition();
            const newPosition = choosenMove.getPosition();
            resolve(new MoveData(new ChessMovePositions(oldPosition, newPosition), pawnPromotionType));*/
            resolve(this.chessCore.getBestMovePossible(color));
            return;
        });
    }
    notifyMove(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessCore.notifyMove(source, dest);
            resolve();
            return;
        });
    }
    canMakeRightCastling(color: PieceColor): Promise<boolean> {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.canMakeRightCastling(color === PieceColor.BLACK));
            return;
        });
    }
    canMakeLeftCastling(color: PieceColor): Promise<boolean> {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.canMakeLeftCastling(color === PieceColor.BLACK));
            return;
        });
    }
    killCore(): Promise<void>
    {
        return new Promise((resolve) =>
        {
            resolve();
            return;
        });
    }

}
