import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessCore } from './chessCore';
import { ChessMovePositions } from './chessMovePositions';
import { IChessCoreAdapter, MoveData } from './IChessCoreAdapter';
import { KingNodeMaster } from './kingnodemaster';
import { PawnSimulationMove } from './PawnSimulationMove';

export class ChessCoreAdapter implements IChessCoreAdapter
{
    private chessCore: ChessCore = null;
    initChessCore(): Promise<void> {
        return new Promise((resolve) =>
        {
            this.chessCore = new ChessCore();
            this.chessCore.initWithoutPiece();
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
            this.chessCore.notifyPromotion(pawnPosition, newType, pawnColor);
            resolve();
            return;
        });
    }
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>
    {
        return new Promise((resolve) =>
        {
            const possiblePositions = this.chessCore.getNode(position).getOutnodePosition();
            resolve(possiblePositions);
            return;
        });
    }
    kingIsInDanger(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.kingIsInDanger(color));
            return;
        });
    }
    capture(position: ICaseBoardPosition): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessCore.setMasterAndUpdateBoard(position, null);
            resolve();
        });
    }
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.canDoEnpassantCapture(source, dest));
            return;
        });
    }
    caseIsEmpty(position: ICaseBoardPosition): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.getNode(position).isFree());
            return;
        });
    }
    caseOccupiedByOpponent(position: ICaseBoardPosition, color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.getNode(position).isOccupiedByOpponent(color));
            return;
        });
    }
    getBestMovePossible(color: PieceColor): Promise<MoveData>
    {
        return new Promise((resolve) =>
        {
            const choosenMove = this.chessCore.getBestMovePossible(color);
            let pawnPromotionType: PieceType = null;
            if (choosenMove instanceof PawnSimulationMove && choosenMove.hasPromotionType())
            {
                pawnPromotionType = choosenMove.getPromotionType();
            }
            const oldPosition = this.chessCore.getNodeOf(choosenMove.getMaster()).getPosition();
            const newPosition = choosenMove.getPosition();
            resolve(new MoveData(new ChessMovePositions(oldPosition, newPosition), pawnPromotionType));
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
            resolve(this.chessCore.canMakeRightCastling(color));
            return;
        });
    }
    canMakeLeftCastling(color: PieceColor): Promise<boolean> {
        return new Promise((resolve) =>
        {
            resolve(this.chessCore.canMakeLeftCastling(color));
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
