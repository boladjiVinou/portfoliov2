const Logic = require('logic-solver');
import * as _ from 'underscore';
export class SudokuSolver {
    private solver = new Logic.Solver();
    private locations: any[] = [];
    public setSudokuRules() {
        const namesLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        this.locations = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.locations.push(Logic.variableBits(namesLetters[i] + namesLetters[j], 4));
            }
        }

        const sumMax = Logic.constantBits(45);
        // contraintes de somme sur les lignes
        for (let i = 0; i < 9; i++) {
            // somme des elements dans chaque ligne egale a 45

            this.solver.require(Logic.equalBits(Logic.sum([this.locations[9 * i], this.locations[9 * i + 1], this.locations[9 * i + 2],
                 this.locations[9 * i + 3], this.locations[9 * i + 4], this.locations[9 * i + 5], this.locations[9 * i + 6],
                  this.locations[9 * i + 7], this.locations[9 * i + 8]]), sumMax));
            // somme des elements dans chaque colonne egale a 45
            this.solver.require(Logic.equalBits(Logic.sum([this.locations[i], this.locations[i + 9], this.locations[i + 18],
                this.locations[i + 27], this.locations[i + 36], this.locations[i + 45], this.locations[i + 54],
                 this.locations[i + 63], this.locations[i + 72]]), sumMax));
            // element distinct dans chaque colonne
            _.each([this.locations[i], this.locations[i + 9], this.locations[i + 18], this.locations[i + 27], this.locations[i + 36],
                 this.locations[i + 45], this.locations[i + 54], this.locations[i + 63], this.locations[i + 72]], (loc1, k) => {
                _.each([this.locations[i], this.locations[i + 9], this.locations[i + 18], this.locations[i + 27], this.locations[i + 36],
                     this.locations[i + 45], this.locations[i + 54], this.locations[i + 63], this.locations[i + 72]], (loc2, l) => {
                    if (k !== l) {
                        this.solver.forbid(Logic.equalBits(loc1, loc2));
                    }
                });
            });
            // element distinct dans chaque ligne
            _.each([this.locations[9 * i], this.locations[9 * i + 1], this.locations[9 * i + 2], this.locations[9 * i + 3],
                 this.locations[9 * i + 4], this.locations[9 * i + 5], this.locations[9 * i + 6], this.locations[9 * i + 7],
                  this.locations[9 * i + 8]], (loc1, k) => {
                _.each([this.locations[9 * i], this.locations[9 * i + 1], this.locations[9 * i + 2], this.locations[9 * i + 3],
                     this.locations[9 * i + 4], this.locations[9 * i + 5], this.locations[9 * i + 6], this.locations[9 * i + 7],
                      this.locations[9 * i + 8]], (loc2, l) => {
                    if (k !== l) {
                        this.solver.forbid(Logic.equalBits(loc1, loc2));
                    }
                });
            });

        }
        const starts = [0, 3, 6, 27, 30, 33, 54, 57, 60];
        starts.forEach(element => {
           // somme des elements dans chaque sous grille egale a 45
           this.solver.require(Logic.equalBits(Logic.sum([this.locations[element], this.locations[element + 1],
            this.locations[element + 2], this.locations[element + 9], this.locations[element + 10],
             this.locations[element + 11], this.locations[element + 18], this.locations[element + 19],
              this.locations[element + 20]]), sumMax));
            // elements distincts dans chaque sous grille
           _.each([this.locations[element], this.locations[element + 1], this.locations[element + 2], this.locations[element + 9],
                    this.locations[element + 10], this.locations[element + 11], this.locations[element + 18],
                    this.locations[element + 19], this.locations[element + 20]], (loc1, k) => {
                _.each([this.locations[element], this.locations[element + 1], this.locations[element + 2],
                        this.locations[element + 9], this.locations[element + 10], this.locations[element + 11],
                        this.locations[element + 18], this.locations[element + 19], this.locations[element + 20]], (loc2, l) => {
                    if (k !== l) {
                        this.solver.forbid(Logic.equalBits(loc1, loc2));
                    }
                });
            });
        });
        // tout les chiffres doivent etre entree 1 et 9
        _.each(this.locations, (loc) => {
            this.solver.require(Logic.greaterThanOrEqual(loc, Logic.constantBits(1)));
            this.solver.require(Logic.lessThanOrEqual(loc, Logic.constantBits(9)));
        });
    }

    getLocations(): any[] {
        return this.locations;
    }
    getSolver(): any {
        return this.solver;
    }
}
