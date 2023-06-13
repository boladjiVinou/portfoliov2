import { ChessNodeState } from './chessnode';
import { BinarySimulationMove, SimulationMove } from './SimulationMove';
import { PieceColor } from '../pieces/PieceColor';
import { BinaryChessCoreState } from './binarChessCoreState';


export interface ISimulator {
    movesGenerator(color: PieceColor): SimulationMove[];
    moveSimulator(move: SimulationMove): void;
    scoreGetter(color: PieceColor): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: ChessNodeState[]): void;
    saveGameState(): ChessNodeState[];
    kingIsInDanger(isBlack: boolean): boolean;
    hasKing(color: PieceColor): boolean;
}
export interface IBinarySimulator {
    movesGenerator(isBlack: boolean): BinarySimulationMove[];
    moveSimulator(move: BinarySimulationMove): void;
    scoreGetter(isBlack: boolean): number;
    gameIsNotOver(): boolean;
    restoreGameState(nodeStates: BinaryChessCoreState): void;
    saveGameState(): BinaryChessCoreState;
    kingIsInDanger(isBlack: boolean): boolean;
    hasKing(isBlack: boolean): boolean;
}

