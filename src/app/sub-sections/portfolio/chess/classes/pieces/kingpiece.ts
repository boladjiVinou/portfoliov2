import { CaseBoardPosition } from '../chessCase';
import { KingSpecialRequestSupplier, PiecesChessManager} from '../chessmanager';
import { ChessPiece, PieceColor } from './chesspiece';

export class KingPiece extends ChessPiece
{
    private specialRequestSupplier: KingSpecialRequestSupplier;
    constructor(position: CaseBoardPosition, mvtValidator: PiecesChessManager, specialReqSupplier: KingSpecialRequestSupplier, color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_king/scene.gltf', position, mvtValidator, color);
        this.positionInBoard = position;
        this.specialRequestSupplier = specialReqSupplier;
    }
    getPossibleDestinations(): CaseBoardPosition[]
    {
        const possiblesMoves: CaseBoardPosition[] = [];
        let possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        // upper
        possiblePosition.I -= 1;
        possiblesMoves.push(possiblePosition);
        // lower
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblesMoves.push(possiblePosition);
        // left
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // right
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // upper left
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // upper right
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // lower left
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        // lower right
        possiblePosition = {I: this.positionInBoard.I , J: this.positionInBoard.J};
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        // castling search 1
        if (this.specialRequestSupplier.canMakeAKingCastle(this, possiblePosition))
        {
            possiblesMoves.push(this.specialRequestSupplier.getKingCastlingPosition(this));
        }
        // castling search 2
        if (this.specialRequestSupplier.canMakeAQueenCastle(this, possiblePosition))
        {
            possiblesMoves.push(this.specialRequestSupplier.getQueenCastlingPosition(this));
        }
        return possiblesMoves.filter(position => this.positionAvailabilityChecker.canMoveTo(this, position));
    }

}
