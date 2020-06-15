import { Injectable } from '@angular/core';
import { SudokuGenerator, GridPair } from './classes/SudokuGenerator';
@Injectable()
export class SudokuService {
    private sudokuGenerator = new SudokuGenerator();
    public GetSudokuGrid(difficulty: number): Promise<GridPair>{
        return new Promise<GridPair>((resolve) => {
            if (typeof(Worker) !== 'undefined') {
                // Yes! Web worker support!
                // Some code.....
                const worker = new Worker('../../../sudoku.worker.ts', { type: 'module' });
                worker.onmessage = (({data}) => {
                    console.log('service msg received');
                    resolve(data);
                });
                worker.onerror = (ev: ErrorEvent) => {
                    console.log(ev);
                };
                worker.postMessage(difficulty);
            } else {
                // Sorry! No Web Worker support..
                this.sudokuGenerator.generateAGrid(difficulty).then((value: GridPair) => {
                    resolve(value);
                });
            }
        });
    }
}
