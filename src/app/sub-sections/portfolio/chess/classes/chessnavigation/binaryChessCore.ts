import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { MinimaxTreeNode } from '../player/MinimaxTreeNode';
import { ChessNodeState } from './chessnode';
import { MoveData } from './IChessCoreAdapter';
import { ISimulator } from './ISimulator';
import { PawnSimulationMove } from './PawnSimulationMove';
import { SimulationMove } from './SimulationMove';

class BinaryChessCore implements ISimulator
{
    // https://www.chessprogramming.org/Bitboards
    pieces: number[] =  [0, 0, 0, 0, 0, 0, 0, 0];
    pieceMoved = 0;
    pawnMovedTwoSquare = 0;
    readonly boardPosByNumber: { [id: number]: ICaseBoardPosition; } = {};
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
    readonly blackKingLeftCastlingPos = 0b0000001000000000000000000000000000000000000000000000000000000000;
    readonly blackKingRightCastlingPos = 0b0010000000000000000000000000000000000000000000000000000000000000;
    readonly whiteKingLeftCastlingPos = 0b0000000000000000000000000000000000000000000000000000000000100000;
    readonly whiteKingRightCastlingPos = 0b0000000000000000000000000000000000000000000000000000000000000010;
    readonly flag01: number;
    readonly flag02: number;
    readonly flag03: number;
    readonly flag04: number;
    readonly flag05: number;
    readonly flag06: number;
    readonly flag71: number;
    readonly flag72: number;
    readonly flag73: number;
    readonly flag74: number;
    readonly flag75: number;
    readonly flag76: number;
    readonly initRightBlackRookFlag: number;
    readonly initLeftBlackRookFlag: number;
    readonly initRightWhiteRookFlag: number;
    readonly initLeftWhiteRookFlag: number;
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
        this.flag01 = 0;
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++)
            {
                this.boardPosByNumber[0b1000000000000000000000000000000000000000000000000000000000000000 >>> (i * 8 + j)] = {I: i, J: j};
            }
        }
        this.flag01 = this.getPosFlag({I: 0, J: 1});
        this.flag02 = this.getPosFlag({I: 0, J: 2});
        this.flag03 = this.getPosFlag({I: 0, J: 3});
        this.flag04 = this.getPosFlag({I: 0, J: 4});
        this.flag05 = this.getPosFlag({I: 0, J: 5});
        this.flag06 = this.getPosFlag({I: 0, J: 6});

        this.flag71 = this.getPosFlag({I: 7, J: 1});
        this.flag72 = this.getPosFlag({I: 7, J: 2});
        this.flag73 = this.getPosFlag({I: 7, J: 3});
        this.flag74 = this.getPosFlag({I: 7, J: 4});
        this.flag75 = this.getPosFlag({I: 7, J: 5});
        this.flag76 = this.getPosFlag({I: 7, J: 6});

        this.initRightBlackRookFlag = this.getPosFlag({I: 0, J: 0});
        this.initLeftBlackRookFlag = this.getPosFlag({I: 0, J: 7});
        this.initRightWhiteRookFlag = this.getPosFlag({I: 7, J: 7});
        this.initLeftWhiteRookFlag = this.getPosFlag({I: 7, J : 0});
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
        return moves.filter(x => x !== 0 &&
            this.safeForPiece(x, pos, isBlack,
                this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
                .map(x => this.getPosFromFlag(x));
    }
    safeForPiece(newMove: number, previousPos: number, isBlack: boolean, posToCheckSafety: number): boolean
    {
        const opponent = isBlack ? BinaryPieceType.White : BinaryPieceType.Black;
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const tmpPiece = posToCheckSafety;
        let tmp = tmpPiece >>> 8;
        const opponentQueenRooks = (this.pieces[BinaryPieceType.Queen] | this.pieces[BinaryPieceType.Rook]) & this.pieces[opponent];
        let currentPieces = this.pieces[current];
        if (newMove !== null && previousPos !== null)
        {
            currentPieces &= ~previousPos;
            currentPieces |= newMove;
        }
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
        tmp = tmpPiece << 8;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        tmp = tmpPiece;
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
        let tmp = pos;
        const moves: number[] = [];
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const validCells = ~this.pieces[current];
        const opponent = this.pieces[isBlack ? BinaryPieceType.White : BinaryPieceType.Black];
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp <<= 9;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponent){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp <<= 7;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponent){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp >>>= 9;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponent){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp >>>= 7;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponent){
                break;
            }
        }
        return moves.filter(x => x !== 0 &&
            this.safeForPiece(x, pos, isBlack,
                this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
                .map(x => this.getPosFromFlag(x));
    }
    generateKnightMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[] = [];
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const validCells = ~this.pieces[current];

        let tmp = pos >>> 10;
        if ((pos & this.knightRight10Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos << 10;
        if ((pos & this.knightLeft10Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos << 6;
        if ((pos & this.knightLeft6Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos >>> 6;
        if ((pos & this.knightRight6Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos << 15;
        if ((pos & this.knightLeft15Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos >>> 15;
        if ((pos & this.knightRight15Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        tmp = pos << 17;
        if ((pos & this.knightLeft17flag) !== 0 && ((tmp) & validCells) !== 0)
       {
         moves.push(tmp);
       }
        tmp = pos >>> 17;
        if ((pos & this.knightRight17Flag) !== 0 && ((tmp) & validCells) !== 0)
       {
           moves.push(tmp);
       }
        return moves.filter(x => x !== 0 &&
        this.safeForPiece(x, pos, isBlack,
            this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
            .map(x => this.getPosFromFlag(x));
    }
    generateRookMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[]  = [];
        const opponent = isBlack ? BinaryPieceType.White : BinaryPieceType.Black;
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
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
        return moves.filter(x => x !== 0 &&
            this.safeForPiece(x, pos, isBlack,
                this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
                .map(x => this.getPosFromFlag(x));
    }
   /*
    * generator1(): IterableIterator<number> {
        yield 55;
        yield 54;
    }*/

    generateKingMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[]  = [];
        const curr = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const validCells =  ~this.pieces[curr];
        let tmp = pos >>> 8;
        if ((tmp & this.pieces[curr]) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        tmp = pos << 8;
        if ((tmp & this.pieces[curr]) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        tmp = pos << 1;
        if ((pos & this.leftBorder) === 0 && (tmp & validCells) !== 0 )
        {
            moves.push(tmp);
        }
        tmp = pos >>> 1;
        if ((pos & this.rightBorder) === 0 && (tmp & validCells) !== 0 )
        {
            moves.push(tmp);
        }
        tmp = pos << 9;
        if ((pos & this.leftBorder) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        tmp = pos >>> 7;
        if ((pos & this.leftBorder) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        tmp = pos >>> 9;
        if ((pos & this.rightBorder) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        tmp = pos << 7;
        if ((pos & this.rightBorder) === 0 && (tmp & validCells) !== 0)
        {
            moves.push(tmp);
        }
        if (this.canMakeLeftCastling(isBlack) )
        {
            moves.push(isBlack ? this.flag06 : this.flag72);
        }
        if (this.canMakeRightCastling(isBlack))
        {
            moves.push(isBlack ? this.flag02 : this.flag76);
        }
        return moves.filter(x => x !== 0 &&
            this.safeForPiece(x, pos, isBlack,
                this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
                .map(x => this.getPosFromFlag(x));
    }
    generateQueenMoves(pos: number , isBlack: boolean): ICaseBoardPosition[]
    {
        const moves: number[]  = [];
        const opponent = isBlack ? BinaryPieceType.White : BinaryPieceType.Black;
        const current = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
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
        // diag
        const validCells = ~this.pieces[current];
        const opponentCells = this.pieces[opponent];
        tmp = pos;
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp <<= 9;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponentCells){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp <<= 7;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponentCells){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.rightBorder) === 0)
        {
            tmp >>>= 9;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponentCells){
                break;
            }
        }
        tmp = pos;
        while (tmp !== 0 && (tmp & this.leftBorder) === 0)
        {
            tmp >>>= 7;
            if (tmp & this.pieces[current]){
                break;
            }
            if (tmp & validCells){
                moves.push(tmp);
            }
            if (tmp & opponentCells){
                break;
            }
        }
        return moves.filter(x => x !== 0 &&
            this.safeForPiece(x, pos, isBlack,
                this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]))
                .map(x => this.getPosFromFlag(x));
    }
    capture(position: ICaseBoardPosition): void
    {
        const pos = this.getPosFlag(position);
        const pColor = (this.pieces[BinaryPieceType.Black] & pos ) === 0 ? BinaryPieceType.White : BinaryPieceType.Black;
        this.pieces[pColor] = this.pieces[pColor] & ~pos;
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
    canMakeRightCastling(isBlack: boolean): boolean {
        const pColor = isBlack ? BinaryPieceType.Black : BinaryPieceType.White;
        const kingMoved = this.pieceMoved & this.pieces[pColor] & this.pieces[BinaryPieceType.King];
        const colorRooks = this.pieces[pColor] & this.pieces[BinaryPieceType.Rook];
        const rightRook = isBlack ? this.initRightBlackRookFlag & colorRooks : this.initRightWhiteRookFlag & colorRooks;
        const rookMoved = rightRook & this.pieceMoved;
        const king = this.pieces[BinaryPieceType.King] & this.pieces[pColor];
        if (rightRook !== 0 && kingMoved === 0 && rookMoved === 0 && !this.kingIsInDanger(isBlack))
        {
            if (isBlack)
            {
                    return (this.flag01 & this.pieces[BinaryPieceType.Black]) === 0 &&
                    (this.flag02 & this.pieces[BinaryPieceType.Black]) === 0 &&
                    (this.flag03 & this.pieces[BinaryPieceType.Black]) === 0 &&
                    (this.safeForPiece(null, null, true, this.flag01 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(null, null, true, this.flag02 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(null, null, true, this.flag03 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(null, null, true, this.flag04 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(this.flag03, this.initRightBlackRookFlag, true, king));
            }
            else
            {
                    return (this.flag74 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.flag75 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.flag76 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.safeForPiece(null, null, false, this.flag74 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(null, null, false, this.flag75 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(null, null, false, this.flag76 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(this.flag75, this.initRightWhiteRookFlag, false, king));
            }
        }
        return false;
    }
    canMakeLeftCastling(isBlack: boolean): boolean {
        const pColor = (isBlack) ? BinaryPieceType.Black : BinaryPieceType.White;
        const kingMoved = this.pieceMoved & this.pieces[pColor] & this.pieces[BinaryPieceType.King];
        const colorRooks = this.pieces[pColor] & this.pieces[BinaryPieceType.Rook];
        const leftRook = (isBlack) ? this.initLeftBlackRookFlag & colorRooks : this.initLeftWhiteRookFlag & colorRooks;
        const rookMoved = leftRook & this.pieceMoved;
        const king = this.pieces[BinaryPieceType.King] & this.pieces[pColor];
        if (leftRook !== 0 && kingMoved === 0 && rookMoved === 0 && !this.kingIsInDanger(isBlack))
        {
            if (!isBlack)
            {
                    return (this.flag71 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.flag72 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.flag73 & this.pieces[BinaryPieceType.White]) === 0 &&
                    (this.safeForPiece(null, null, false, this.flag71 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(null, null, false, this.flag72 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(null, null, false, this.flag73 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(null, null, false, this.flag74 & this.pieces[BinaryPieceType.White])) &&
                    (this.safeForPiece(this.flag73, this.initLeftWhiteRookFlag, false, king));
            }
            else
            {
                    return (this.flag06 & this.pieces[BinaryPieceType.Black]) === 0 &&
                    (this.flag05 & this.pieces[BinaryPieceType.Black]) === 0 &&
                    (this.safeForPiece(null, null, true, this.flag04 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(null, null, true, this.flag05 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(null, null, true, this.flag06 & this.pieces[BinaryPieceType.Black])) &&
                    (this.safeForPiece(this.flag05 , this.initLeftBlackRookFlag, true, king));
            }
        }
        return false;
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
    kingIsInDanger(isBlack: boolean): boolean
    {
        return !this.safeForPiece(null, null, isBlack, this.pieces[BinaryPieceType.King] & this.pieces[isBlack ? BinaryPieceType.Black : BinaryPieceType.White]);
    }
    getBestMovePossible(color: PieceColor): MoveData
    {
        throw new Error('Method not implemented.');
    }
    canDoEnPassantCapture(source: ICaseBoardPosition, dest: ICaseBoardPosition): boolean
    {
        throw new Error('Method not implemented.');
    }
    hasKing(color: PieceColor): boolean {
        const pColor = color === PieceColor.BLACK ? BinaryPieceType.Black : BinaryPieceType.White;
        return (this.pieces[pColor] & this.pieces[BinaryPieceType.King]) !== 0;
    }

}
