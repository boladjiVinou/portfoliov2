import { ChessNodeState } from './chessnode';
import { SimulationMove } from './SimulationMove';
import { PieceColor } from '../pieces/PieceColor';


export interface ISimulator {
    movesGenerator(color: PieceColor): SimulationMove[];
    moveSimulator(move: SimulationMove): void;
    scoreGetter(color: PieceColor): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: ChessNodeState[]): void;
    saveGameState(): ChessNodeState[];
    kingIsInDanger(color: PieceColor): boolean;
    hasKing(color: PieceColor): boolean;
}
