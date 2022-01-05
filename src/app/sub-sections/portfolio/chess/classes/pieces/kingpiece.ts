import { ICaseBoardPosition } from '../chessCase';
import { IKingSpecialRequestSupplier, IPiecesRequestSupplier} from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class KingPiece extends ChessPiece
{
    private specialRequestsSupplier: IKingSpecialRequestSupplier;
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_king/scene.gltf', color);
    }
    public setNavigationChecker( mvtValidator: IKingSpecialRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        let possiblePosition = this.currentCase.getCasePosition();
        // upper
        possiblePosition.I -= 1;
        possiblesMoves.push(possiblePosition);
        // lower
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblesMoves.push(possiblePosition);
        // left
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // right
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // upper left
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // upper right
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // lower left
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // lower right
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // castling search 1
        if ( this.specialRequestsSupplier.canMakeAKingCastle(this, possiblePosition))
        {
            possiblesMoves.push(this.specialRequestsSupplier.getKingCastlingPosition(this));
        }
        // castling search 2
        if (this.specialRequestsSupplier.canMakeAQueenCastle(this, possiblePosition))
        {
            possiblesMoves.push(this.specialRequestsSupplier.getQueenCastlingPosition(this));
        }
        return possiblesMoves.filter(position => this.positionAvailabilityChecker.canMoveTo(this, position));
    }

}
