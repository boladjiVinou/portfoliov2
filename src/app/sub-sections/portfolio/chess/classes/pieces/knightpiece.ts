import { ChessPiece } from './chesspiece';
import { PieceColor } from './PieceColor';
import { PieceType } from './PieceType';

export class KnightPiece extends ChessPiece
{
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/knight_-_low_poly/scene.gltf', color);
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
