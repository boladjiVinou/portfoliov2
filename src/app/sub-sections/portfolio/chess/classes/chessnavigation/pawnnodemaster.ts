import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessNodeMaster, ChessNodeMasterState } from './chessnodemaster';
import { PawnSimulationMove } from './PawnSimulationMove';
import { SimulationMove } from './SimulationMove';

export class PawnNodeMaster extends ChessNodeMaster
{
    private mvtDirection: number;
    private hasMovedTwoSquares = false;
    constructor(color: PieceColor)
    {
        super(color);
        this.mvtDirection = (color === PieceColor.WHITE) ? -1 : 1;
        this.chessType = PieceType.PAWN;
        this.value *= 10;
    }
    public getMvtDirection()
    {
        return this.mvtDirection;
    }
    public clone(): PawnNodeMaster
    {
        const pawn = new PawnNodeMaster((this.color === PieceColor.BLACK) ? PieceColor.BLACK : PieceColor.WHITE);
        pawn.originalPosition = {I: this.originalPosition.I, J: this.originalPosition.J};
        pawn.hasMovedOnce = this.hasMovedOnce;
        pawn.hasMovedTwoSquares = this.hasMovedTwoSquares;
        return pawn;
    }
    public getPositions(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        // front moves
        let possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        if (!this.hasMoved())
        {
            possiblePosition.I += (2 * this.mvtDirection);
            const tmpPos = {I: currentPosition.I + this.mvtDirection , J: currentPosition.J};
            if (this.nodeProvider.getNode(possiblePosition).isFree() && this.nodeProvider.getNode(tmpPos).isFree())
            {
                possiblesMoves.push(possiblePosition);
            }
        }

        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (this.mvtDirection);
        if (this.isAValidPosition(possiblePosition) && (this.nodeProvider.getNode(possiblePosition).isFree()))
        {
            possiblesMoves.push(possiblePosition);
        }

        // diagonal moves
        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (this.mvtDirection);
        possiblePosition.J += 1;
        if (this.isAValidPosition(possiblePosition) && this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition) && this.canDoEnPassantCapture({I: currentPosition.I, J: currentPosition.J}, potentialEnPassantPosition))
        {
            possiblesMoves.push(possiblePosition);
        }

        possiblePosition = {I: currentPosition.I, J: currentPosition.J};
        possiblePosition.I += (this.mvtDirection);
        possiblePosition.J -= 1;
        if (this.isAValidPosition(possiblePosition) && this.nodeProvider.getNode(possiblePosition).isOccupiedByOpponent(this.color))
        {
            possiblesMoves.push(possiblePosition);
        }

        const potentialEnPassantPosition2 = {I: possiblePosition.I, J: possiblePosition.J};
        potentialEnPassantPosition2.I -= (this.mvtDirection);
        if (this.isAValidPosition(potentialEnPassantPosition2) && this.canDoEnPassantCapture({I: currentPosition.I, J: currentPosition.J}, potentialEnPassantPosition2))
        {
            possiblesMoves.push(possiblePosition);
        }
        return possiblesMoves.filter(position => this.positionIsSafeForTheKing(position));
    }

    public getSimulationMoves(): SimulationMove[]
    {
        const moves: PawnSimulationMove[] = [];
        this.nodeProvider.getNodeOf(this).getOutnodePosition().forEach(position => {
            moves.push(new PawnSimulationMove(position, this));
            if (this.color === PieceColor.BLACK && this.originalPosition.I === 1 && position.I === 7)
            {
                moves[moves.length - 1].setPromotionType(PieceType.QUEEN);
            }
            else if (this.color === PieceColor.WHITE && this.originalPosition.I === 6 && position.I === 0)
            {
                moves[moves.length - 1].setPromotionType(PieceType.QUEEN);
            }
            if (moves[moves.length - 1].hasPromotionType())
            {
                moves.push(new PawnSimulationMove(position, this));
                moves[moves.length - 1].setPromotionType(PieceType.KNIGHT);
            }
        });
        return moves;
    }

    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquares;
    }

    public setHasMovedTwoSquares(hasMoved: boolean): void
    {
        this.hasMovedTwoSquares = hasMoved;
    }

    public canDoEnPassantCapture(currentPosition: ICaseBoardPosition, targetPosition: ICaseBoardPosition): boolean
    {
        const isOnRightRow = (this.color === PieceColor.BLACK) ? currentPosition.I === 4 : currentPosition.I === 3;
        if (!this.nodeProvider.getNode(targetPosition).isFree() && isOnRightRow )
        {
            const positionOwner = this.nodeProvider.getNode(targetPosition).getOwner();
            return positionOwner.getColor() !== this.getColor() && (positionOwner instanceof PawnNodeMaster)
                    && (positionOwner as PawnNodeMaster).getHasMovedTwoSquares() && (Math.abs(currentPosition.J - targetPosition.J) === 1);
        }
        else
        {
            return false;
        }
    }

    public isDoingEnPassantCapture(currentPosition: ICaseBoardPosition, nextPosition: ICaseBoardPosition): boolean
    {
        if (currentPosition.J !== nextPosition.J)
        {
            const potentialEnPassantPosition = {I: nextPosition.I, J: nextPosition.J};
            potentialEnPassantPosition.I -= (this.mvtDirection);
            return this.canDoEnPassantCapture(currentPosition, potentialEnPassantPosition);
        }
        return false;
    }

    public getState(): ChessNodeMasterState
    {
        return new PawnNodeMasterState(this);
    }

    public restoreState(state: PawnNodeMasterState): void
    {
        super.restoreState(state);
        this.mvtDirection = state.getMvtDirection();
        this.hasMovedTwoSquares = state.getHasMovedTwoSquares();
    }
}

export class PawnNodeMasterState extends ChessNodeMasterState
{
    private readonly mvtDirection: number;
    private readonly hasMovedTwoSquares: boolean;
    constructor(master: PawnNodeMaster)
    {
        super(master);
        this.mvtDirection = master.getMvtDirection();
        this.hasMovedTwoSquares = master.getHasMovedTwoSquares();
    }
    public getMvtDirection()
    {
        return this.mvtDirection;
    }
    public getHasMovedTwoSquares(): boolean
    {
        return this.hasMovedTwoSquares;
    }
}

