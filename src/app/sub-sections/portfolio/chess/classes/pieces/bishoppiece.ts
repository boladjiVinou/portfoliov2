import { ChessPiece } from './chesspiece';
import { PieceColor } from './PieceColor';
import { PieceType } from './PieceType';

export class BishopPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_bishop/scene.gltf', color);
    }

    public getType(): Readonly<PieceType>
    {
        return PieceType.BISHOP;
    }
}
