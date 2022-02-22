import * as Logic from 'logic-solver'; // https://github.com/meteor/logic-solver
import * as _ from 'underscore';
import { SudokuSolver } from './SudokuSolver';
export interface GridPair {
    grid: number[];
    solution: number[];
  }

export class SudokuGenerator {
    private binarizedPreviousGrids: any[][] = [];
    private previousData: GridPair[] = [];
    private sudokuSolver: SudokuSolver;
    public constructor() {
        this.sudokuSolver = new SudokuSolver();
        this.sudokuSolver.setSudokuRules();
        this.binarizedPreviousGrids = [];
        this.previousData = [];
    }

    public generateAGrid(nbOfVoid: number = 18): Promise<GridPair> {
        // tslint:disable-next-line:ban-types
        return new Promise<GridPair>((resolve: (Function)) => {
            this.generateSudokuLogically(nbOfVoid).then((grid) => {
                resolve(grid);
                return;
            }).catch((err) => {
                this.binarizedPreviousGrids = [];
                this.generateSudokuLogically(nbOfVoid).then((grid) => {
                    resolve(grid);
                    return;
                });
            });
        });
    }
    private checkIfThereIsOnlyOneSolution(grid: number[]): boolean {
        const sudokuSolver = new SudokuSolver();
        sudokuSolver.setSudokuRules();
        const binarizedGid = grid.map((value) => {
            if (value > 0) {
                return Logic.constantBits(value);
            }
            else {
                return Logic.constantBits(0);
            }
        });
        // similitude a la grille passee en parametre
        _.each(sudokuSolver.getLocations(), (value: any, index) => {
            _.each(binarizedGid, (gridVal: any, gridIndex) => {
                if (index === gridIndex && grid[gridIndex] > 0 ) {
                    sudokuSolver.getSolver().require(Logic.equalBits(value, gridVal));
                }
            });
        });
        let result: any[] = [];
        const solution = sudokuSolver.getSolver().solve();
        if (solution === null){
            return false;
        }
        result = _.map(sudokuSolver.getLocations(), (loc) => solution.evaluate(loc));
        const binarizedPreviousResult = result.map((value) => {
            if (value > 0) {
                return Logic.constantBits(value);
            }else {
                return Logic.constantBits(0);
            }
        });
        const logicalXORArray: any[] = [];
        _.each(sudokuSolver.getLocations(), (value: any, index) => {
            _.each(binarizedPreviousResult, (resVal: any, resIndex) => {
                // si c est un input il doit etre different de ceux trouves auparavent
                if (index === resIndex && grid[resIndex] < 0 ) {
                    logicalXORArray.push(Logic.not(Logic.equalBits(value, resVal)));
                }
            });
        });
        sudokuSolver.getSolver().require(Logic.or(logicalXORArray));
        return (sudokuSolver.getSolver().solve() === null);
        // si c est non nul c est qu il y a une 2e solution et ce n est pas ce qu on veut
    }

    private insertVoidInSudokuGrid(grid: number[], nbOfVoid: number): number[] {
        const newGrid: number[] = [];
        for (let k = 0; k < 81; ++k) {
            newGrid.push(grid[k]);
        }
        const indexes = Array.from(Array(81).keys());
        this.shuffleArray(indexes);
        let counter = nbOfVoid;
        let i = 0;
        while (counter > 0 && i < 81) {
            if (newGrid[indexes[i]] !== -1){
                const oldValue = newGrid[indexes[i]];
                newGrid[indexes[i]] = -1;
                if (!this.checkIfThereIsOnlyOneSolution(newGrid)) {
                        newGrid[indexes[i]] = oldValue;
                    }else {
                        --counter;
                    }
            }
            ++i;
        }
        return newGrid;
    }
    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    public copyArray(list: number[]): number[]{
        const newGrid: number[] = [];
        for (let i = 0; i < 81; ++i) {
            newGrid.push(list[i]);
        }
        return newGrid;
    }

    private generateSudokuLogically(nbOfVoid: number): Promise<GridPair> {
        return new Promise((resolve) => {

            if (this.binarizedPreviousGrids !== undefined && this.binarizedPreviousGrids.length > 0) {
                _.each(this.binarizedPreviousGrids, (loc, grid) => {
                    _.each(this.sudokuSolver.getLocations(), (loc1, k) => {
                        _.each(grid, (loc2, l) => {
                            if (k === l && Math.random() >= 0.5) {
                                this.sudokuSolver.getSolver().forbid(Logic.equalBits(loc1, loc2));
                            }
                        });
                    });
                });
            }
            const solution = this.sudokuSolver.getSolver().solve();
            let result = _.map(this.sudokuSolver.getLocations(), (loc) => solution.evaluate(loc));
            const copySolution = this.copyArray(result);
            result = this.insertVoidInSudokuGrid(result, nbOfVoid);
            this.previousData.push({grid: result, solution: copySolution});

            const sudokuGrid: number[][] = [];
            const tmpGrid = result.map((value) => {
                if (value > 0) {
                    return Logic.constantBits(value);
                }else {
                    return Logic.constantBits(0);
                }
            });
            this.binarizedPreviousGrids.push(tmpGrid);
            for (let i = 0; i < 9; ++i) {
                sudokuGrid.push([]);
                for (let j = 0; j < 9; ++j) {
                    sudokuGrid[i].push(result[9 * i + j]);
                }
            }
            resolve(this.previousData[this.previousData.length - 1]);
            return;
        });

    }
}

