/// <reference lib="webworker" />
import { SudokuGenerator } from './../app/sub-sections/portfolio/sudoku/classes/SudokuGenerator';
declare function postMessage(message: any): void;
const sudokuGenerator = new SudokuGenerator();
let generatingAGrid = false;
addEventListener('message', ({ data }) => {
  console.log('msg received');
  if (!generatingAGrid){
      generatingAGrid = true;
      sudokuGenerator.generateAGrid(data).then((value: any) => {
          generatingAGrid = false;
          self.postMessage(value);
      });
  }
});
