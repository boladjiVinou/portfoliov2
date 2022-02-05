import { ChessPiece, PieceColor, PieceType } from './chesspiece';

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
