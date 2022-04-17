import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';

export class PieceAbstraction// I created this class only to use it in the web worker
{
    public color: Readonly<PieceColor>;
    public type: Readonly<PieceType>;
    public position: Readonly<ICaseBoardPosition>;
    public hasMoved: Readonly<boolean>;
    public originalPosition: ICaseBoardPosition;
    public constructor(pColor: PieceColor, pType: PieceType, pPosition: ICaseBoardPosition, pOriginalPosition: ICaseBoardPosition, pHasMoved: boolean)
    {
        this.color = pColor;
        this.type = pType;
        this.position = pPosition;
        this.hasMoved = pHasMoved;
        this.originalPosition = pOriginalPosition;
    }
}
