import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessMovePositions } from '../chessnavigation/chessMovePositions';
import { PieceAbstraction } from '../chessnavigation/pieceabstraction';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessPlayer } from './chessplayer';
import { ChessWorkerData, WorkerMoveGenerationData, WorkerMoveGenerationResult } from './chessworkerdata';
import { WorkerMessageType } from './workermessagetype';
// import * as WorkerPool from 'workerpool';
// https://github.com/josdejong/workerpool

export class AsyncAIChessPlayer extends ChessPlayer
{
    // good to test with https://github.com/AnshGaikwad/Chess-World/tree/master/engines
    private aiType: AIType;
    private color: PieceColor;
    private readonly delayBetweenActions: 2000;
    private pawnPromotionType: PieceType = PieceType.QUEEN;
    moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>;
    private heavyProcessNotifyer: (isProcessing: boolean) => void;
    private chessWorker = new Worker('./chess.Worker.ts', {name: 'chess-worker', type: 'module' });
    private getBoardSummary: () => PieceAbstraction[];
    constructor(aiType: AIType, moveSubmiter: (targetPosition: ICaseBoardPosition, currentPosition: ICaseBoardPosition) => Promise<void>, gameSummaryGetter: () => PieceAbstraction[],
                heavyProcesingNotifyer: (isProcessing: boolean) => void , color: PieceColor)
    {
        super();
        this.aiType = aiType;
        this.color = color;
        this.moveSubmiter = moveSubmiter;
        this.heavyProcessNotifyer = heavyProcesingNotifyer;
        this.getBoardSummary = gameSummaryGetter;
        this.chessWorker.onmessage = (() => {
            console.log('response received');
        });
        this.chessWorker.onerror = (ev: ErrorEvent) => {
            console.log(ev);
        };
    }
    public getColor(): PieceColor {
        return this.color;
    }
    public play(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            this.heavyProcessNotifyer(true);
            const start = performance.now();
            this.chessWorker.onmessage = (({data}) => {
                const receivedData = data as WorkerMoveGenerationResult;
                const chosenPosition = receivedData.move;
                if (receivedData.pawnPromotionType !== null || receivedData.pawnPromotionType !== undefined)
                {
                    this.pawnPromotionType = receivedData.pawnPromotionType;
                }
                const end = performance.now();
                const waitingTime = Math.max(this.delayBetweenActions - (end - start), 1);
                setTimeout(() => {
                    // console.log('realizing', chosenPosition);
                    this.moveSubmiter(chosenPosition.destination, chosenPosition.source).then(() =>
                        {
                            this.heavyProcessNotifyer(false);
                            resolve();
                            return;
                        });
                        }, waitingTime);
                    }
            );
            const generateMoveMsg = new ChessWorkerData(WorkerMessageType.GENERATE_AI_MOVE, new WorkerMoveGenerationData(this.getBoardSummary(), this.color));
            this.chessWorker.postMessage(generateMoveMsg);
        });
    }

    public selectPawnPromotionType(pawn: ICaseBoardPosition): Promise<PieceType> {
        return new Promise<PieceType>((resolve) => {
            resolve(this.pawnPromotionType);
        });
    }

}
export enum AIType
{
    MININMAX,
    REINFORCEMENT
}
