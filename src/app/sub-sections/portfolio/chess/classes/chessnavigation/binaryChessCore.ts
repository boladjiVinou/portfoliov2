import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { ChessNodeState } from './chessnode';
import { MoveData } from './IChessCoreAdapter';
import { ISimulator } from './ISimulator';
import { SimulationMove } from './SimulationMove';

class BinaryChessCore implements ISimulator
{
    // https://www.chessprogramming.org/Bitboards
    pieces: number[] =  [0, 0, 0, 0, 0, 0, 0, 0];
    boardPosByNumber: { [id: number]: ICaseBoardPosition; } = {};
    pieceMoved = 0;
    pawnMovedTwoSquare = 0;
    readonly leftBorder =        0b1000000010000000100000001000000010000000100000001000000010000000;
    readonly rightBorder =       0b0000000100000001000000010000000100000001000000010000000100000001;
    readonly knightRight10Flag = 0b1111110011111100111111001111110011111100111111001111110000000000;
    readonly knightLeft10Flag =  0b0000000000111111001111110011111100111111001111110011111100111111;
    readonly knightLeft6Flag =   0b0000000011111100111111001111110011111100111111001111110011111100;
    readonly knightRight6Flag =  0b0011111100111111001111110011111100111111001111110011111100000000;
    readonly knightLeft15Flag =  0b0000000000000000111111101111111011111110111111101111111011111110;
    readonly knightRight15Flag = 0b0111111101111111011111110111111101111111011111110000000000000000;
    readonly knightLeft17flag =  0b0000000000000000011111110111111101111111011111110111111101111111;
    readonly knightRight17Flag = 0b1111111011111110111111101111111011111110111111100000000000000000;
    /*
    enum PieceType
{
    Black,
    White,
    Pawn,
    Bishop,
    Rook,
    Knight,
    Queen,
    King
}

black at 0
white at 7 on init

    */
    constructor()
    {
        this.pieces[0] = 0b1111111111111111000000000000000000000000000000000000000000000000;
        this.pieces[1] = 0b0000000000000000000000000000000000000000000000001111111111111111;
        this.pieces[2] = 0b0000000011111111000000000000000000000000000000001111111100000000;
        this.pieces[3] = 0b0010010000000000000000000000000000000000000000000000000000100100;
        this.pieces[4] = 0b1000000100000000000000000000000000000000000000000000000010000001;
        this.pieces[5] = 0b0100001000000000000000000000000000000000000000000000000001000010;
        this.pieces[6] = 0b0001000000000000000000000000000000000000000000000000000000010000;
        this.pieces[7] = 0b0000100000000000000000000000000000000000000000000000000000001000;
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++)
            {
                this.boardPosByNumber[0b1000000000000000000000000000000000000000000000000000000000000000 >>> (i * 8 + j)] = {I: i, J: j};
            }
        }
    }



    private getPosFlag(pos: ICaseBoardPosition): number
    {
        return 0b1000000000000000000000000000000000000000000000000000000000000000 >>> (pos.I * 8 + pos.J);
    }
    private getPosFromFlag(pos: number): ICaseBoardPosition
    {
        return {I: this.boardPosByNumber[pos].I, J: this.boardPosByNumber[pos].J};
    }
    playerHasAMoveToDo(color: PieceColor): boolean
    {
        throw new Error('Method not implemented.');
        switch (color)
        {
            case PieceColor.BLACK:
            break;
            case PieceColor.WHITE:
            break;
        }
    }
    notifyPromotion(pawnPosition: ICaseBoardPosition, newType: PieceType): void
    {
        let nextType = BinaryPieceType.Pawn;
        switch (newType)
        {
            case PieceType.BISHOP:
                nextType = BinaryPieceType.Bishop;
                break;
            case PieceType.KNIGHT:
                nextType = BinaryPieceType.Knight;
                break;
            case PieceType.QUEEN:
                nextType = BinaryPieceType.Queen;
                break;
            case PieceType.ROOK:
                nextType = BinaryPieceType.Rook;
                break;
        }
        const pos = this.getPosFlag(pawnPosition);
        this.pieces[BinaryPieceType.Pawn] =  this.pieces[BinaryPieceType.Pawn] & ~pos;
        this.pieces[nextType] = this.pieces[nextType] | pos;
    }
    getPossibleDestinations(position: ICaseBoardPosition): ICaseBoardPosition[]
    {
        const pos = this.getPosFlag(position);
        const isBlack = (this.pieces[BinaryPieceType.Black] & pos) !== 0;
        if ((this.pieces[BinaryPieceType.Pawn] & pos) !== 0)
        {
            return this.generatePawnMoves(pos, isBlack);
        }
        else if ((this.pieces[BinaryPieceType.Rook] & pos) !== 0)
        {
            return this.generateRookMoves(pos, isBlack);
        }
        else if ((this.pieces[BinaryPieceType.Knight] & pos) !== 0)
        {
            return this.generateKnightMoves(pos, isBlack);
        }
        else if ((this.pieces[BinaryPieceType.Bishop] & pos) !== 0)
        {
            return this.generateBishopMoves(pos, isBlack);
        }
        else if ((this.pieces[BinaryPieceType.Queen] & pos) !== 0)
        {
            return this.generateQueenMoves(pos, isBlack);
        }
        else if ((this.pieces[BinaryPieceType.King] & pos) !== 0)
        {
            return this.generateKingMoves(pos, isBlack);
        }
        return [];
    }
    generatePawnMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[]  = [];
        // front moves
        if (isBlack)
        {
            const oneCase = pos >>> 8;
            if (oneCase !== 0 && (oneCase & this.pieces[BinaryPieceType.Black] ) === 0)
            {
                moves.push(oneCase);
            }
            if ((this.pieceMoved & pos ) === 0)
            {
                const twoCase = pos >>> 16;
                if (twoCase !== 0 && (twoCase & this.pieces[BinaryPieceType.Black] ) === 0)
                {
                    moves.push(twoCase);
                }
            }
        }
        else
        {
            const oneCase = pos << 8;
            if (oneCase !== 0 && (oneCase & this.pieces[BinaryPieceType.White] ) === 0)
            {
                moves.push(oneCase);
            }
            if ((this.pieceMoved & pos ) === 0)
            {
                const twoCase = pos << 16;
                if (twoCase !== 0 && (twoCase & this.pieces[BinaryPieceType.White] ) === 0)
                {
                    moves.push(twoCase);
                }
            }
        }
        // diagonal moves
        if (this.leftBorder & pos)
        {
            if (isBlack)
            {
                const tmp = pos >>> 9;
                if ((tmp & this.pieces[BinaryPieceType.White]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.White] & this.pieces[BinaryPieceType.Pawn] & (pos >>> 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
            else
            {
                const tmp = pos << 7;
                if ((tmp & this.pieces[BinaryPieceType.Black]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.Black] & this.pieces[BinaryPieceType.Pawn] & (pos >>> 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
        }
        else if (this.rightBorder & pos)
        {
            if (isBlack)
            {
                const tmp = pos >>> 7;
                if ((tmp & this.pieces[BinaryPieceType.White]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.White] & this.pieces[BinaryPieceType.Pawn] & (pos << 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
            else
            {
                const tmp = pos << 9;
                if ((tmp & this.pieces[BinaryPieceType.Black]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.Black] & this.pieces[BinaryPieceType.Pawn] & (pos << 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
        }
        else
        {
            if (isBlack)
            {
                let tmp = pos >>> 9;
                if ((tmp & this.pieces[BinaryPieceType.White]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.White] & this.pieces[BinaryPieceType.Pawn] & (pos >>> 1)) !== 0)
                {
                    moves.push(tmp);
                }
                tmp = pos >>> 7;
                if ((tmp & this.pieces[BinaryPieceType.White]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.White] & this.pieces[BinaryPieceType.Pawn] & (pos << 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
            else
            {
                let tmp = pos << 7;
                if ((tmp & this.pieces[BinaryPieceType.Black]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.Black] & this.pieces[BinaryPieceType.Pawn] & (pos >>> 1)) !== 0)
                {
                    moves.push(tmp);
                }
                tmp = pos << 9;
                if ((tmp & this.pieces[BinaryPieceType.Black]) !== 0 ||
                (this.pawnMovedTwoSquare & this.pieces[BinaryPieceType.Black] & this.pieces[BinaryPieceType.Pawn] & (pos << 1)) !== 0)
                {
                    moves.push(tmp);
                }
            }
        }
        return moves.filter(x => x !== 0 && this.validForKing(x, pos, isBlack)).map(x => this.getPosFromFlag(x));
    }
    validForKing(pos: number, previous: number, isBlack: boolean): boolean
    {
        const opponent = isBlack ? BinaryPieceType.White : BinaryPieceType.Black;
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const king = this.pieces[BinaryPieceType.King] & this.pieces[current];
        let tmp = king >>> 8;
        const opponentQueenRooks = (this.pieces[BinaryPieceType.Queen] | this.pieces[BinaryPieceType.Rook]) & this.pieces[opponent];
        let currentPieces = this.pieces[current];
        currentPieces &= ~previous;
        currentPieces |= pos;
        const queenBishopBlocker = (this.pieces[opponent] & ~(this.pieces[BinaryPieceType.Queen] | this.pieces[BinaryPieceType.Rook])) | currentPieces;
        // row explore
        while (tmp !== 0)
        {
            if (tmp & queenBishopBlocker)
            {
                break;
            }
            if ((tmp & opponentQueenRooks) !== 0)
            {
                return false;
            }
            tmp >>>= 8;
        }
        tmp = king << 8;
        while (tmp !== 0)
        {
            if (tmp & queenBishopBlocker)
            {
                break;
            }
            if ((tmp & opponentQueenRooks) !== 0)
            {
                return false;
            }
            tmp <<= 8;
        }
        // column explore
        tmp = king;
        if ((tmp & this.leftBorder) === 0)
        {
            do
            {
                tmp <<= 1;
                if (tmp & queenBishopBlocker)
                {
                    break;
                }
                if ((tmp & opponentQueenRooks) !== 0)
                {
                    return false;
                }
            } while (tmp !== 0 && (tmp & this.leftBorder) === 0);
        }
        tmp = king;
        if ((tmp & this.rightBorder) === 0)
        {
            do
            {
                tmp >>>= 1;
                if (tmp & queenBishopBlocker)
                {
                    break;
                }
                if ((tmp & opponentQueenRooks) !== 0)
                {
                    return false;
                }
            } while (tmp !== 0 && (tmp & this.rightBorder) === 0);
        }
         // pawn attacks
        const opponentPawns = this.pieces[opponent] & this.pieces[BinaryPieceType.Pawn];
        tmp = king;
        if (tmp !== 0 && (tmp & this.leftBorder) === 0)
         {
             if ((tmp << 9) & opponentPawns){
                 return false;
             }
         }
        if (tmp !== 0 && (tmp & this.rightBorder) === 0)
         {
             if ((tmp << 7) & opponentPawns){
                 return false;
             }
         }
        if (tmp !== 0 && (tmp & this.rightBorder) === 0)
         {
             if ((tmp >>> 9) & opponentPawns){
                 return false;
             }
         }
        if (tmp !== 0 && (tmp & this.leftBorder) === 0)
         {
             if ((tmp >>> 7) & opponentPawns){
                 return false;
             }
         }
        // diag explore
        const opponentQueenBishop = this.pieces[opponent] & (this.pieces[BinaryPieceType.Queen] | this.pieces[BinaryPieceType.Bishop]);
        tmp = king;
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp <<= 9;
            if (tmp & queenBishopBlocker){
                break;
            }
            if (tmp & opponentQueenBishop){
                return false;
            }
        }
        tmp = king;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp <<= 7;
            if (tmp & queenBishopBlocker){
                break;
            }
            if (tmp & opponentQueenBishop){
                return false;
            }
        }
        tmp = king;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp >>>= 9;
            if (tmp & queenBishopBlocker){
                break;
            }
            if (tmp & opponentQueenBishop){
                return false;
            }
        }
        tmp = king;
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp >>>= 7;
            if (tmp & queenBishopBlocker){
                break;
            }
            if (tmp & opponentQueenBishop){
                return false;
            }
        }
        const opponentKnights = this.pieces[opponent] & this.pieces[BinaryPieceType.Knight];
        tmp = king;
        /*
        >>> 10: si <= l avant derniere ligne && < avant dernier colonne
        << 10: si > premiere ligne && > 2e colonne
        << 6: si < avant derniere colonne && > premiere ligner
        >>> 6 : si < derniere ligne && > 2e colonne
        << 15 : si > 2e ligne && < derniere colonne
        >>> 15: si < avant derniere ligne && > premiere colonne
        << 17 : si > 2e ligne && > premiere colonne
        >>> 17 : si < avant dernier ligne && < derniere colonne
        */
        if ((tmp & this.knightRight10Flag) !== 0 && ((tmp >>> 10) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightLeft10Flag) !== 0 && ((tmp << 10) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightLeft6Flag) !== 0 && ((tmp << 6) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightRight6Flag) !== 0 && ((tmp >>> 6) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightLeft15Flag) !== 0 && ((tmp << 15) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightRight15Flag) !== 0 && ((tmp >>> 15) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightLeft17flag) !== 0 && ((tmp << 17) & opponentKnights) !== 0)
       {
            return false;
       }
        if ((tmp & this.knightRight17Flag) !== 0 && ((tmp >>> 17) & opponentKnights) !== 0)
       {
            return false;
       }
        return true;
    }
    generateBishopMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        throw new Error('Method not implemented.');
    }
    generateKnightMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        throw new Error('Method not implemented.');
    }
    generateRookMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[]  = [];
        const opponent = isBlack ? BinaryPieceType.White : BinaryPieceType.Black;
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const opponentQueenRooks = (this.pieces[BinaryPieceType.Queen] | this.pieces[BinaryPieceType.Rook]) & this.pieces[opponent];
        // row explore
        let tmp = pos >>> 8;
        while (tmp !== 0)
        {
            if (tmp & this.pieces[current])
            {
                break;
            }
            moves.push(tmp);
            if (tmp & this.pieces[opponent])
            {
                break;
            }
            tmp >>>= 8;
        }
        tmp = pos << 8;
        while (tmp !== 0)
        {
            if (tmp & this.pieces[current])
            {
                break;
            }
            moves.push(tmp);
            if (tmp & this.pieces[opponent])
            {
                break;
            }
            tmp <<= 8;
        }
        // column explore
        tmp = pos;
        if ((tmp & this.leftBorder) === 0)
        {
            do
            {
                tmp <<= 1;
                if (tmp & this.pieces[current])
                {
                    break;
                }
                moves.push(tmp);
                if (tmp & this.pieces[opponent])
                {
                    break;
                }
            } while (tmp !== 0 && (tmp & this.leftBorder) === 0);
        }
        tmp = pos;
        if ((tmp & this.rightBorder) === 0)
        {
            do
            {
                tmp >>>= 1;
                if (tmp & this.pieces[current])
                {
                    break;
                }
                moves.push(tmp);
                if (tmp & this.pieces[opponent])
                {
                    break;
                }
            } while (tmp !== 0 && (tmp & this.rightBorder) === 0);
        }
        // missing castling
        return moves.filter(x => x !== 0 && this.validForKing(x, pos, isBlack)).map(x => this.getPosFromFlag(x));
    }
    generateKingMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        throw new Error('Method not implemented.');
    }
    generateQueenMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        throw new Error('Method not implemented.');
    }
    capture(position: ICaseBoardPosition): void
    {
        const pos = this.getPosFlag(position);
        const pColor = (this.pieces[BinaryPieceType.Black] & pos ) === 0 ? BinaryPieceType.White : BinaryPieceType.Black;
        this.pieces[pColor] = this.pieces[pColor] & ~pos;
    }
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): boolean
    {
        throw new Error('Method not implemented.');
    }
    caseIsEmpty(position: ICaseBoardPosition): boolean
    {
        const pos =  this.getPosFlag(position);
        return ((this.pieces[BinaryPieceType.Black] | this.pieces[BinaryPieceType.White] ) & pos ) === 0 ;
    }
    caseOccupiedByOpponent(position: ICaseBoardPosition, color: PieceColor): boolean
    {
        const pColor = color === PieceColor.BLACK ? BinaryPieceType.White : BinaryPieceType.Black;
        const pos =  this.getPosFlag(position);
        return (this.pieces[pColor] & pos) !== 0;
    }
    getBestMovePossible(color: PieceColor): MoveData
    {
        throw new Error('Method not implemented.');
    }
    notifyMove(source: ICaseBoardPosition, dest: ICaseBoardPosition): void
    {
        const pos =  this.getPosFlag(source);
        const pColor = (this.pieces[BinaryPieceType.Black] & pos ) === 0 ? BinaryPieceType.White : BinaryPieceType.Black;
        let pType = BinaryPieceType.Pawn;
        if ((this.pieces[pColor] & this.pieces[BinaryPieceType.Rook] & pos ) !== 0)
        {
            pType = BinaryPieceType.Rook;
        }
        else if ((this.pieces[pColor] & this.pieces[BinaryPieceType.Knight] & pos ) !== 0)
        {
            pType = BinaryPieceType.Knight;
        }
        else if ((this.pieces[pColor] & this.pieces[BinaryPieceType.Bishop] & pos ) !== 0)
        {
            pType = BinaryPieceType.Bishop;
        }
        else if ((this.pieces[pColor] & this.pieces[BinaryPieceType.Queen] & pos ) !== 0)
        {
            pType = BinaryPieceType.Queen;
        }
        else if ((this.pieces[pColor] & this.pieces[BinaryPieceType.King] & pos ) !== 0)
        {
            pType = BinaryPieceType.King;
        }


        this.pieceMoved |= pos;

        this.pieces[pType] = this.pieces[pType] & ~pos;
        this.pieces[pColor] = this.pieces[pColor] & ~pos;

        const nextPos = this.getPosFlag(dest);
        this.pieces[pColor] = this.pieces[pColor] | nextPos;
        this.pieces[pType] = this.pieces[pType] | nextPos;

        if (pType === BinaryPieceType.Pawn)
        {
            if (pColor === BinaryPieceType.White)
            {
                this.pawnMovedTwoSquare |= ((nextPos >>> 16) & pos);
            }
            else
            {
                this.pawnMovedTwoSquare |= ((nextPos << 16) & pos);
            }
        }
    }
    canMakeRightCastling(color: PieceColor): boolean {
        throw new Error('Method not implemented.');
    }
    canMakeLeftCastling(color: PieceColor): boolean {
        throw new Error('Method not implemented.');
    }

    movesGenerator(color: PieceColor): SimulationMove[]
    {
        throw new Error('Method not implemented.');
    }
    moveSimulator(move: SimulationMove): void {
        throw new Error('Method not implemented.');
    }
    scoreGetter(color: PieceColor): number {
        throw new Error('Method not implemented.');
    }
    gameIsNotOver(): boolean {
        throw new Error('Method not implemented.');
    }
    restoreGameState(nodeStates: ChessNodeState[]): void {
        throw new Error('Method not implemented.');
    }
    saveGameState(): ChessNodeState[] {
        throw new Error('Method not implemented.');
    }
    kingIsInDanger(color: PieceColor): boolean {
        throw new Error('Method not implemented.');
    }
    hasKing(color: PieceColor): boolean {
        const pColor = color === PieceColor.BLACK ? BinaryPieceType.Black : BinaryPieceType.White;
        return (this.pieces[pColor] & this.pieces[BinaryPieceType.King]) !== 0;
    }

}
