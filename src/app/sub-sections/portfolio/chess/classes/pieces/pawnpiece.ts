import { ICaseBoardPosition, IVisitedCase } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class PawnPiece extends ChessPiece
{
    private mvtDirection = 1;
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_pawn/scene.gltf', color);
    }
    visit(host: IVisitedCase): void
    {
        if (!this.hasMovedOnce)
        {
            if (host.getCasePosition().I > 3)
            {
                this.mvtDirection *= -1;
            }
        }
        super.visit(host);
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        let possiblePosition = this.currentCase.getCasePosition();
        if (!this.hasMovedOnce)
        {
            possiblePosition.I += (2 * this.mvtDirection);
            if (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) )
            {
                possiblesMoves.push(possiblePosition);
                possiblePosition = {I: possiblePosition.I + (2 * this.mvtDirection), J: possiblePosition.J};
            }
        }
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += (1 * this.mvtDirection);
        if (this.positionAvailabilityChecker.canMoveTo(this, possiblePosition) )
        {
            possiblesMoves.push(possiblePosition);
            possiblePosition = {I: possiblePosition.I + (1 * this.mvtDirection), J: possiblePosition.J};
        }
        return possiblesMoves;
    }
}
