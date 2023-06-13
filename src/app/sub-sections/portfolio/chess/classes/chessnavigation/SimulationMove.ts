import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { ChessNodeMaster } from './chessnodemaster';
import {BinaryPieceType} from './binarypieceType';


export class SimulationMove {
    protected position: ICaseBoardPosition;
    protected master: ChessNodeMaster;
    constructor(position: ICaseBoardPosition, master: ChessNodeMaster) {
        this.position = position;
        this.master = master;
    }
    public getPosition(): ICaseBoardPosition {
        return this.position;
    }
    public getMaster(): ChessNodeMaster {
        return this.master;
    }
}

export class BinarySimulationMove {
    readonly from: number;
    readonly dest: number;
    constructor(origin: number, destination: number) {
        this.from = origin;
        this.dest = destination;
    }
    public getOrigin(): number
    {
        return this.from;
    }
    public getDestination(): number
    {
        return this.dest;
    }
}

export class BinaryPawnSimulationMove extends BinarySimulationMove
{
    readonly promotionType: BinaryPieceType;
    constructor(origin: number, destination: number, prom: BinaryPieceType )
    {
        super(origin, destination);
        this.promotionType = prom;
    }
    public getPromotionType(): BinaryPieceType
    {
        return this.promotionType;
    }
}

export class BinaryKingSimulationMove extends BinarySimulationMove
{
    readonly isCastling: boolean;
    readonly leftCastling: boolean;
    constructor(origin: number, destination: number, castling: boolean, leftCastling: boolean)
    {
        super(origin, destination);
        this.isCastling = castling;
        this.leftCastling = leftCastling;
    }

    public getIsCastling(): boolean
    {
        return this.isCastling;
    }
    public getLeftCastling(): boolean
    {
        return this.leftCastling;
    }
}
