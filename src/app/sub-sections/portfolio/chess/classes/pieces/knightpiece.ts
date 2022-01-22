import { ICaseBoardPosition } from '../board/chessCase';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';

export class KnightPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/knight_-_low_poly/scene.gltf', color);
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        const possiblesMoves: ICaseBoardPosition[] = [];
        const positionInBoard = this.currentCase.getCasePosition();
        possiblesMoves.push({I: positionInBoard.I + 2, J: positionInBoard.J + 1});
        possiblesMoves.push({I: positionInBoard.I + 2, J: positionInBoard.J - 1});
        possiblesMoves.push({I: positionInBoard.I - 2, J: positionInBoard.J + 1});
        possiblesMoves.push({I: positionInBoard.I - 2, J: positionInBoard.J - 1});
        possiblesMoves.push({I: positionInBoard.I + 1, J: positionInBoard.J + 2});
        possiblesMoves.push({I: positionInBoard.I + 1, J: positionInBoard.J - 2});
        possiblesMoves.push({I: positionInBoard.I - 1, J: positionInBoard.J + 2});
        possiblesMoves.push({I: positionInBoard.I - 1, J: positionInBoard.J - 2});

        return possiblesMoves.filter(position => this.isAValidPosition(position) && //
                                    (this.positionAvailabilityChecker.caseIsEmpty(position) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, position)));
    }
    canJumpOverOtherPieces(): boolean
    {
        return true;
    }
    public init(): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                super.init().then(() =>
                {
                    if (this.color === PieceColor.BLACK)
                    {
                        this.getModel().rotateY(Math.PI);
                    }
                    resolve();
                    return;
                });
            });
    }
    public getType(): Readonly<PieceType>
    {
        return PieceType.KNIGHT;
    }
}
