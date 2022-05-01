/// <reference lib="webworker" />
import { ChessMovePositions } from '../chessnavigation/chessMovePositions';
import { ChessCore } from '../chessnavigation/chessCore';
import { PawnSimulationMove } from '../chessnavigation/PawnSimulationMove';
import { PieceType } from '../pieces/PieceType';
import { ChessWorkerData, WorkerCaseOccupiedByOpponentData, WorkerCheckResult, WorkerMoveGenerationResult, WorkerMoveNotification, WorkerPawnPromotionData } from './chessworkerdata';
import { WorkerMessageType } from './workermessagetype';
import { PieceColor } from '../pieces/PieceColor';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
declare function postMessage(message: any): void;
let chessCore: ChessCore = null;
let lifeWarranty: any = null;
onmessage = (ev: MessageEvent) => {
    const msg  = ev.data as ChessWorkerData;
    // console.log(msg.type);
    switch (msg.type)
    {
        case WorkerMessageType.INIT_CORE:
            chessCore = new ChessCore();
            chessCore.initWithoutPiece();
            if (lifeWarranty !== null)
            {
                clearInterval(lifeWarranty);
            }
            lifeWarranty = setInterval(() =>
            {
                console.log('thread alive');
            }, 20000);
            self.postMessage(true);
            break;
        case WorkerMessageType.PLAYER_HAS_A_MOVE_TODO:
            if (lifeWarranty != null)
            {
                const color = msg.data as PieceColor;
                self.postMessage(chessCore.playerHasAMoveToDo(color));
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.NOTIFY_PROMOTION:
            if (lifeWarranty != null)
            {
                const promotionParameter = msg.data as WorkerPawnPromotionData;
                chessCore.notifyPromotion(promotionParameter.pawnPosition, promotionParameter.newType, promotionParameter.pawnColor);
                self.postMessage(true);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.NOTIFY_MOVE:
            if (lifeWarranty != null)
            {
                const notificationParameter = msg.data as WorkerMoveNotification;
                chessCore.notifyMove(notificationParameter.oldPosition, notificationParameter.newPosition);
                self.postMessage(true);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.GET_POSSIBLE_DESTINATIONS:
            if (lifeWarranty != null)
            {
                const position = msg.data as ICaseBoardPosition;
                const possiblePositions = chessCore.getNode(position).getOutnodePosition();
                self.postMessage(possiblePositions);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.KING_IS_IN_DANGER:
            if (lifeWarranty != null)
            {
                const color = msg.data as PieceColor;
                const result = chessCore.kingIsInDanger(color);
                self.postMessage(result);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.REALIZE_CAPTURE:
            if (lifeWarranty != null)
            {
                const capturedPosition = msg.data as ICaseBoardPosition;
                chessCore.setMasterAndUpdateBoard(capturedPosition, null);
                self.postMessage(true);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.CAN_DO_EN_PASSANT_CAPTURE:
            if (lifeWarranty != null)
            {
                const move = msg.data as WorkerMoveNotification;
                self.postMessage(chessCore.canDoEnpassantCapture(move.oldPosition, move.newPosition));
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.CASE_IS_EMPTY:
            if (lifeWarranty != null)
            {
                const position = msg.data as ICaseBoardPosition;
                self.postMessage(chessCore.getNode(position).isFree());
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.CASE_OCCUPIED_BY_OPPONENT:
            if (lifeWarranty != null)
            {
                const param = msg.data as WorkerCaseOccupiedByOpponentData;
                self.postMessage(chessCore.getNode(param.position).isOccupiedByOpponent(param.color));
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.GET_BEST_MOVE_POSSIBLE:
            if (lifeWarranty != null)
            {
                const color = msg.data as PieceColor;
                const choosenMove = chessCore.getBestMovePossible(color);
                let pawnPromotionType: PieceType = null;
                if (choosenMove instanceof PawnSimulationMove && choosenMove.hasPromotionType())
                {
                    pawnPromotionType = choosenMove.getPromotionType();
                }
                const oldPosition = chessCore.getNodeOf(choosenMove.getMaster()).getPosition();
                const newPosition = choosenMove.getPosition();
                const moveToGive = new WorkerMoveGenerationResult(new ChessMovePositions(oldPosition, newPosition), pawnPromotionType);
                self.postMessage(moveToGive);
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.CAN_MAKE_LEFT_CASTLING:
            if (lifeWarranty != null)
            {
                const color = msg.data as PieceColor;
                self.postMessage(chessCore.canMakeLeftCastling(color));
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.CAN_MAKE_RIGHT_CASTLING:
            if (lifeWarranty != null)
            {
                const color = msg.data as PieceColor;
                self.postMessage(chessCore.canMakeRightCastling(color));
            }
            else
            {
                console.log('dead thread');
            }
            break;
        case WorkerMessageType.KILL_CORE:
            if (lifeWarranty != null)
            {
                clearInterval(lifeWarranty);
            }
            lifeWarranty = null;
            chessCore = null;
            break;
    }
};
