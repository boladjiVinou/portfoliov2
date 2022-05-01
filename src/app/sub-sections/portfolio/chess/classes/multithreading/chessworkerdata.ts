import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessMovePositions } from '../chessnavigation/chessMovePositions';
import { PieceAbstraction } from '../chessnavigation/pieceabstraction';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';

export class ChessWorkerData
{
    public type: number;
    public data: any;
    public constructor(type: number, data: any)
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
    public pawnPromotionType: PieceType = null;
    public constructor(move: ChessMovePositions, pawnPromotionType: PieceType)
    {
        this.move = move;
        this.pawnPromotionType = pawnPromotionType;
    }
}

export class WorkerPawnPromotionData
{
    public pawnPosition: ICaseBoardPosition;
    public newType: PieceType;
    public pawnColor: PieceColor;
    public constructor(pos: ICaseBoardPosition, pType: PieceType, color: PieceColor)
    {
        this.pawnPosition = pos;
        this.newType = pType;
        this.pawnColor = color;
    }
}

export class WorkerCheckResult
{
    public isInCheck: boolean;
    constructor(check: boolean)
    {
        this.isInCheck = check;
    }
}

export class WorkerMoveNotification
{
    public oldPosition: ICaseBoardPosition;
    public newPosition: ICaseBoardPosition;
    public constructor(oldPos: ICaseBoardPosition, newPos: ICaseBoardPosition)
    {
        this.oldPosition = oldPos;
        this.newPosition = newPos;
    }
}

export class WorkerCaseOccupiedByOpponentData
{
    public position: ICaseBoardPosition;
    public color: PieceColor;
    public constructor(position: ICaseBoardPosition, color: PieceColor)
    {
        this.position = position;
        this.color = color;
    }
}
