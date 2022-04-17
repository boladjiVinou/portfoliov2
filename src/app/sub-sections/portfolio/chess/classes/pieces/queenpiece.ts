import { ChessPiece } from './chesspiece';
import { PieceColor } from './PieceColor';
import { PieceType } from './PieceType';

export class QueenPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/queen_-_low_poly/scene.gltf', color);
    }
    public getType(): Readonly<PieceType>
    {
        return PieceType.QUEEN;
    }
}
