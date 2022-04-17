import { ChessMovePositions } from '../chessnavigation/chessMovePositions';
import { PieceAbstraction } from '../chessnavigation/pieceabstraction';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';

export class ChessWorkerData
{
    public type: string;
    public data: any;
    public constructor(type: string, data: any)
    {
        this.type = type;
        this.data = data;
    }
}
export class WorkerMoveGenerationData
{
    public board: PieceAbstraction[];
    public  aiColor: PieceColor;
    public constructor(board: PieceAbstraction[], aiColor: PieceColor)
    {
        this.board = board;
        this.aiColor = aiColor;
    }
}
export class WorkerMoveGenerationResult
{
    public move: ChessMovePositions;
    public pawnPromotionType: PieceType;
    public constructor(move: ChessMovePositions, pawnPromotionType: PieceType)
    {
        this.move = move;
        this.pawnPromotionType = pawnPromotionType;
    }
}
