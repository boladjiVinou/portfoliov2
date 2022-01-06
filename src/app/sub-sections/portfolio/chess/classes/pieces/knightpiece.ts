import { ICaseBoardPosition } from '../chessCase';
import { IPiecesRequestSupplier } from '../chessmovesmanager';
import { ChessPiece, PieceColor } from './chesspiece';

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

        return possiblesMoves.filter(position => this.positionAvailabilityChecker.canMoveTo(this, position));
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
}
