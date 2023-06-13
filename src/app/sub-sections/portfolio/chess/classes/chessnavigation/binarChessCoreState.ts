export class BinaryChessCoreState
{
    public readonly pieces: number[];
    public readonly pieceMoved: number;
    public readonly pawnMovedTwoSquare: number;
    constructor(pieces: number[], pieceMove: number, pawnMovedTwo: number)
    {
        this.pieces = pieces;
        this.pieceMoved = pieceMove;
        this.pawnMovedTwoSquare = pawnMovedTwo;
    }
}
