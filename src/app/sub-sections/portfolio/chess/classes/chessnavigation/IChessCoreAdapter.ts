import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessMovePositions } from './chessMovePositions';

export interface IChessCoreAdapter
{
    initChessCore(): Promise<void>;
    playerHasAMoveToDo(color: PieceColor): Promise<boolean>;
    notifyPromotion( pawnPosition: ICaseBoardPosition, newType: PieceType, pawnColor: PieceColor): Promise<void>;
    notifyMove(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<void>;
    getPossibleDestinations(position: ICaseBoardPosition): Promise<ICaseBoardPosition[]>;
    kingIsInDanger(color: PieceColor): Promise<boolean>;
    capture(position: ICaseBoardPosition): Promise<void>;
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): Promise<boolean>;
    caseIsEmpty(position: ICaseBoardPosition): Promise<boolean>;
    caseOccupiedByOpponent(position: ICaseBoardPosition, color: PieceColor): Promise<boolean>;
    getBestMovePossible(color: PieceColor): Promise<MoveData>;
    canMakeRightCastling(color: PieceColor): Promise<boolean>;
    canMakeLeftCastling(color: PieceColor): Promise<boolean>;
    killCore(): Promise<void>;
}

export class MoveData
{
    public move: ChessMovePositions;
    public pawnPromotionType: PieceType = null;
    public constructor(move: ChessMovePositions, pawnPromotionType: PieceType)
    {
        this.move = move;
        this.pawnPromotionType = pawnPromotionType;
    }
}
