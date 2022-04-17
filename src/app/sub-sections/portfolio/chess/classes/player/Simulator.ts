import { ChessNodeState } from '../chessnavigation/chessnode';
import { ChessNodeProvider } from '../chessnavigation/chessnodeprovider';
import { SimulationMove } from '../chessnavigation/SimulationMove';
import { PieceColor } from '../pieces/PieceColor';
import { ISimulator } from './MinimaxTreeNode';

export class Simulator implements ISimulator {
    private provider: ChessNodeProvider;
    constructor(provider: ChessNodeProvider) {
        this.provider = provider;
    }
    kingIsInDanger(color: PieceColor): boolean {
        return this.provider.kingIsInDanger(color);
    }
    hasKing(color: PieceColor): boolean {
        return this.provider.hasKing(color);
    }
    restoreGameState(nodeStates: ChessNodeState[]): void {
        this.provider.restoreGameState(nodeStates);
    }
    saveGameState(): ChessNodeState[] {
        return this.provider.saveGameState();
    }
    gameIsNotOver(): boolean {
        return this.provider.hasKing(PieceColor.BLACK) && this.provider.hasKing(PieceColor.WHITE);
    }
    movesGenerator(color: PieceColor): SimulationMove[] {
        return this.provider.getPossibleSimulationMoves(color);
    }
    moveSimulator(move: SimulationMove): void {
        this.provider.simulateMove(move);
    }
    scoreGetter(color: PieceColor): number {
        return this.provider.getScore(color);
    }
    getProvider(): ChessNodeProvider
    {
        return this.provider;
    }
}
