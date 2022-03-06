import { ICaseBoardPosition } from '../board/chessCase';
import { PieceType } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';
import { SimulationMove } from './SimulationMove';


export class PawnSimulationMove extends SimulationMove {
    private promotionType: PieceType = null;
    constructor(position: ICaseBoardPosition, master: ChessNodeMaster) {
        super(position, master);
    }
    public hasPromotionType(): boolean {
        return this.promotionType !== null;
    }

    public getPromotionType(): PieceType {
        return this.promotionType;
    }

    public setPromotionType(pieceType: PieceType): void {
        this.promotionType = pieceType;
    }
}
