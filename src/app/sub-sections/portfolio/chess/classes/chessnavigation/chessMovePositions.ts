import { ICaseBoardPosition } from '../board/ICaseBoardPosition';

export class ChessMovePositions
{
    public source: Readonly<ICaseBoardPosition>;
    public destination: Readonly<ICaseBoardPosition>;
    public constructor(src: ICaseBoardPosition, dest: ICaseBoardPosition)
    {
        this.source = src;
        this.destination = dest;
    }
}
