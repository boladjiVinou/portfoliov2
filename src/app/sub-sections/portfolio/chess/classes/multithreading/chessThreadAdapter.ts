import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { IChessCoreAdapter, MoveData } from '../chessnavigation/IChessCoreAdapter';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessWorkerData, WorkerCaseOccupiedByOpponentData, WorkerCheckResult, WorkerMoveGenerationResult, WorkerMoveNotification, WorkerPawnPromotionData } from './chessworkerdata';
import { WorkerMessageType } from './workermessagetype';

export class ChessThreadAdapter implements IChessCoreAdapter
{
    private chessWorker = new Worker('./chess.Worker.ts', {name: 'chess-worker', type: 'module' });
    private heavyProcesingNotifyer: (isProcessing: boolean) => void;
    constructor(heavyProcesingNotifyer: (isProcessing: boolean) => void)
    {
        this.heavyProcesingNotifyer = heavyProcesingNotifyer;
        this.chessWorker.onerror = (ev) =>
        {
            console.log(ev);
        };
    }
    notifyMove(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                resolve();
                return;
            });
            const param = new WorkerMoveNotification(source, dest);
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.NOTIFY_MOVE, param));
        });
    }
    canMakeRightCastling(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.CAN_MAKE_RIGHT_CASTLING, color));
        });
    }
    canMakeLeftCastling(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.CAN_MAKE_LEFT_CASTLING, color));
        });
    }
    //  new ChessWorkerData
    initChessCore(): Promise<void>
    {
        return new Promise((resolve) =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                resolve();
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.INIT_CORE, null));
        });
    }
    playerHasAMoveToDo(color: PieceColor): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            this.heavyProcesingNotifyer(true);
            const param = new ChessWorkerData(WorkerMessageType.PLAYER_HAS_A_MOVE_TODO, color);
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(param);
        });
    }
    notifyPromotion(pawnPosition: ICaseBoardPosition, newType: PieceType, pawnColor: PieceColor): Promise<void>
    {
        return new Promise<void>(resolve =>
        {
            this.heavyProcesingNotifyer(true);
            const paramData = new WorkerPawnPromotionData(pawnPosition, newType, pawnColor);
            const param = new ChessWorkerData(WorkerMessageType.NOTIFY_PROMOTION, paramData );
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve();
                return;
            });
            this.chessWorker.postMessage(param);
        });
    }
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as ICaseBoardPosition[]);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.GET_POSSIBLE_DESTINATIONS, position));
        });
    }
    kingIsInDanger(color: PieceColor): Promise<boolean>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.KING_IS_IN_DANGER, color));
        });
    }
    capture(position: ICaseBoardPosition): Promise<void>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve();
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.REALIZE_CAPTURE, position));
        });
    }
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<boolean>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            const param = new WorkerMoveNotification(source, dest);
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.CAN_DO_EN_PASSANT_CAPTURE, param));
        });
    }
    caseIsEmpty(position: ICaseBoardPosition): Promise<boolean>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.CASE_IS_EMPTY, position));
        });
    }
    caseOccupiedByOpponent(position: ICaseBoardPosition, color: PieceColor): Promise<boolean>
    {
        this.heavyProcesingNotifyer(true);
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                resolve(data as boolean);
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.CASE_OCCUPIED_BY_OPPONENT, new WorkerCaseOccupiedByOpponentData(position, color)));
        });
    }
    getBestMovePossible(color: PieceColor): Promise<MoveData>
    {
        return new Promise(resolve =>
        {
            this.heavyProcesingNotifyer(true);
            this.chessWorker.onmessage = (({data}) =>
            {
                this.heavyProcesingNotifyer(false);
                const result = data as WorkerMoveGenerationResult;
                resolve(new MoveData(result.move, result.pawnPromotionType));
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.GET_BEST_MOVE_POSSIBLE, color));
        });
    }
    killCore(): Promise<void>
    {
        return new Promise(resolve =>
        {
            this.chessWorker.onmessage = (({data}) =>
            {
                resolve();
                return;
            });
            this.chessWorker.postMessage(new ChessWorkerData(WorkerMessageType.KILL_CORE, null));
        });
    }

}
