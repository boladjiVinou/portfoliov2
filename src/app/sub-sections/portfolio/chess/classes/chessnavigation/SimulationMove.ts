import { ICaseBoardPosition } from '../board/chessCase';
import { ChessNodeMaster } from './chessnodemaster';


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
