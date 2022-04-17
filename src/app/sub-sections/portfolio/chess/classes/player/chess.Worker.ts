/// <reference lib="webworker" />
import { ChessMovePositions } from '../chessnavigation/chessMovePositions';
import { ChessNodeProvider } from '../chessnavigation/chessnodeprovider';
import { PawnSimulationMove } from '../chessnavigation/PawnSimulationMove';
import { PieceType } from '../pieces/PieceType';
import { ChessWorkerData, WorkerMoveGenerationData, WorkerMoveGenerationResult } from './chessworkerdata';
import { MinimaxTreeNode } from './MinimaxTreeNode';
import { Simulator } from './Simulator';
import { WorkerMessageType } from './workermessagetype';
declare function postMessage(message: any): void;
onmessage = (ev: MessageEvent) => {
    const msg  = ev.data as ChessWorkerData;
    switch (msg.type)
    {
        case WorkerMessageType.GENERATE_AI_MOVE:
            const boardState = (msg.data as WorkerMoveGenerationData);
            const provider = new ChessNodeProvider();
            console.log('minimax start', performance.now());
            provider.initFromAbstractPiece(boardState.board);
            console.log('minimax restore end', performance.now());
            const simulator = new Simulator(provider);
            const minimaxRoot = new MinimaxTreeNode(null, simulator, boardState.aiColor, 4, null);
            const choosenMove = minimaxRoot.getElectedMove();
            let pawnPromotionType: PieceType = null;
            if (choosenMove instanceof PawnSimulationMove && choosenMove.hasPromotionType())
            {
                pawnPromotionType = choosenMove.getPromotionType();
            }
            const oldPosition = simulator.getProvider().getNodeOf(choosenMove.getMaster()).getPosition();
            const newPosition = choosenMove.getPosition();
            const moveToGive = new WorkerMoveGenerationResult(new ChessMovePositions(oldPosition, newPosition), pawnPromotionType);
            console.log('minimax end', performance.now());
            self.postMessage(moveToGive);
            break;
    }
};
