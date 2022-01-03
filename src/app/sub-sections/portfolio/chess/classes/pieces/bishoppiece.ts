import { CaseBoardPosition } from '../chessCase';
import { PiecesChessManager } from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class BishopPiece extends ChessPiece
{
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_bishop/scene.gltf', position, mvtValidator, color);
        this.positionInBoard = position;
    }
    getPossibleDestinations(): CaseBoardPosition[]
    {
        const possiblesMoves: CaseBoardPosition[] = [];
        // upper left search
        let possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        while (possiblePosition.I >= 0 && possiblePosition.J >= 0)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J - 1};
        }
        // upper right search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        while (possiblePosition.I >= 0 && possiblePosition.J < 8)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I - 1, J: possiblePosition.J + 1};
        }
        // lower left search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        while (possiblePosition.I < 8 && possiblePosition.J >= 0)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J - 1};
        }
        // lower right search
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        while (possiblePosition.I < 8 && possiblePosition.J < 8)
        {
            possiblesMoves.push(possiblePosition);
            if (!this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, possiblePosition))
            {
                break;
            }
            possiblePosition = {I: possiblePosition.I + 1, J: possiblePosition.J + 1};
        }
        return possiblesMoves;
    }

}
