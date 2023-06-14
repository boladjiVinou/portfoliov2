import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { BinaryPieceType } from './binarypieceType';
import { ChessNodeMaster } from './chessnodemaster';
export class ChessNodeWeightGiver
{
    private knightWeights: number[][] = [   [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
                                            [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
                                            [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
                                            [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
                                            [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
                                            [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
                                            [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
                                            [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]];
    private pawnWeights: number[][] = [ [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
                                        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
                                        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
                                        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
                                        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
                                        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
                                        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
                                        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]];
    private kingWeights: number[][] = [ [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
                                        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
                                        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
                                        [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
                                        [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
                                        [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
                                        [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
                                        [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]];
    private rookWeights: number[][] = [ [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
                                        [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
                                        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
                                        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
                                        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
                                        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
                                        [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
                                        [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]];
    private queenWeights: number[][] = [[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
                                        [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
                                        [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
                                        [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
                                        [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
                                        [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
                                        [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
                                        [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]];
    private bishopWeights: number[][] = [[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
                                        [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
                                        [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
                                        [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
                                        [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
                                        [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
                                        [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
                                        [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]];

    public getChessNodeValue(master: ChessNodeMaster, position: ICaseBoardPosition): number
    {
        if (master === null || master === undefined)
        {
            return 0;
        }
        const row = (master.getColor() === PieceColor.WHITE) ? position.I : 7 - position.I;
        const factor = (master.getColor() === PieceColor.WHITE) ? -1 : 1;
        switch (master.getType())
        {
            case PieceType.BISHOP:
                return factor * this.bishopWeights[row][position.J];
            case PieceType.KING:
                return factor * this.kingWeights[row][position.J];
            case PieceType.KNIGHT:
                return factor * this.knightWeights[row][position.J];
            case PieceType.PAWN:
                return factor * this.pawnWeights[row][position.J];
            case PieceType.QUEEN:
                return factor * this.queenWeights[row][position.J];
            case PieceType.ROOK:
                return factor * this.rookWeights[row][position.J];
        }
    }
    public getChessPieceValue(pType: BinaryPieceType, position: ICaseBoardPosition, isBlack: boolean): number
    {
        const row = (!isBlack) ? position.I : 7 - position.I;
        const factor = (isBlack) ? 1 : -1;
        switch (pType)
        {
            case BinaryPieceType.Bishop:
                return 30 + factor * this.bishopWeights[row][position.J];
            case BinaryPieceType.King:
                return 900 + factor * this.kingWeights[row][position.J];
            case BinaryPieceType.Knight:
                return 30 + factor * this.knightWeights[row][position.J];
            case BinaryPieceType.Pawn:
                return 10 + factor * this.pawnWeights[row][position.J];
            case BinaryPieceType.Queen:
                return 90 + factor * this.queenWeights[row][position.J];
            case BinaryPieceType.Rook:
                return 50 + factor * this.rookWeights[row][position.J];
        }
    }
}
