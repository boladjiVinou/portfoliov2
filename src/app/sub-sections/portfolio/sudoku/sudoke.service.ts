import { Injectable } from '@angular/core';
import { SudokuGenerator, GridPair } from './classes/SudokuGenerator';
@Injectable()
export class SudokuService {
    private sudokuGenerator = new SudokuGenerator();
    public GetSudokuGrid(difficulty: number): Promise<GridPair>{
        return new Promise<GridPair>((resolve) => {
            this.sudokuGenerator.generateAGrid(difficulty).then((value: GridPair) => {
                resolve(value);
            });
        });
    }
}
