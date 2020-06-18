import { Injectable } from '@angular/core';
import { SudokuGenerator, GridPair } from './classes/SudokuGenerator';
@Injectable()
export class SudokuService {
    private sudokuGenerator = new SudokuGenerator();
    public GetSudokuGrid(difficulty: number): Promise<GridPair>{
        return new Promise<GridPair>((resolve) => {
            const customGenerator = () => {
                console.log('falling back');
                this.sudokuGenerator.generateAGrid(difficulty).then((value: GridPair) => {
                    console.log('resolved');
                    resolve(value);
                    return;
                });
            };
            if (typeof(Worker) !== 'undefined') {
                // Yes! Web worker support!
                // Some code.....
                const worker = new Worker('./classes/Sudoku.Worker.ts', { type: 'module' });
                worker.onmessage = (({data}) => {
                    console.log('service msg received');
                    resolve(data);
                });
                worker.onerror = (ev: ErrorEvent) => {
                    console.log(ev);
                    customGenerator();
                };
                worker.postMessage(difficulty);
                // worker generated by using ng generate web-worker <location>
            } else {
                // Sorry! No Web Worker support..
                customGenerator();
            }
        });
    }
}