import { ICaseBoardPosition } from '../board/chessCase';
import { IKingSpecialRequestSupplier} from '../board/chessmovesmanager';
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
        this.specialRequestsSupplier = mvtValidator;
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        let possiblesMoves: ICaseBoardPosition[] = [];
        let possiblePosition = this.currentCase.getCasePosition();
        //
        possiblePosition.I -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);

        possiblesMoves = possiblesMoves.filter(position => this.isAValidPosition(position) && //
        ( this.positionAvailabilityChecker.caseIsEmpty(position) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, position)));

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
        return possiblesMoves;
    }

}
