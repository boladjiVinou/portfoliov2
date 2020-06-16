/// <reference lib="webworker" />
import { SudokuGenerator } from './SudokuGenerator';
declare function postMessage(message: any): void;
const sudokuGenerator = new SudokuGenerator();
let generatingAGrid = false;
onmessage = (ev: MessageEvent) => {
    console.log('msg received 2');
    if (!generatingAGrid){
        generatingAGrid = true;
        sudokuGenerator.generateAGrid(ev.data).then((value: any) => {
            generatingAGrid = false;
            self.postMessage(value);
        });
    }
};
/*
self.addEventListener('message', (ev: MessageEvent) => {
    console.log('msg received');
    if (!generatingAGrid){
        generatingAGrid = true;
        let nbInput = 0;
        switch (ev.data as string){
            case '1':
                nbInput = 18;
                break;
            case '2':
                nbInput = 36;
                break;
            case '3':
                nbInput = 72;
                break;
             /*default:
                    const error = new Error();
                    error.message = ev.data;
                    throw error;*/
    /*    }
        sudokuGenerator.generateAGrid(nbInput).then((value: GridPair) => {
            generatingAGrid = false;
            self.postMessage('oula');
        });
    }
});
*/
