import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { PieceType } from '../pieces/PieceType';
import { MinimaxTreeNode } from '../player/MinimaxTreeNode';
import { BishopNodeMaster } from './bishopnodemaster';
import { ChessNode, ChessNodeState } from './chessnode';
import { ChessNodeMaster } from './chessnodemaster';
import { ISimulator } from './ISimulator';
import { KingNodeMaster } from './kingnodemaster';
import { KnightNodeMaster } from './knightNodeMaster';
import { PawnNodeMaster } from './pawnnodemaster';
import { PawnSimulationMove } from './PawnSimulationMove';
import { PieceAbstraction } from './pieceabstraction';
import { QueenNodeMaster } from './queennodemaster';
import { RookNodeMaster } from './rooknodemaster';
import { SimulationMove } from './SimulationMove';

export class ChessCore implements ISimulator
{
    private nodes: ChessNode[][] = [];
    private knights: ChessNodeMaster[] = [];
    private kings: ChessNodeMaster[] = [];
    private rightBlackRook: ChessNodeMaster = null;
    private leftBlackRook: ChessNodeMaster = null;
    private rightWhiteRook: ChessNodeMaster = null;
    private leftWhiteRook: ChessNodeMaster = null;
    private positionByPiece: Map<ChessNodeMaster, ICaseBoardPosition> = new Map<ChessNodeMaster, ICaseBoardPosition>();
    private masterById: Map<number, ChessNodeMaster> = new Map<number, ChessNodeMaster>();
    private absoluteMax = 0;
    constructor()
    {
        this.initNodes();
    }
    movesGenerator(color: PieceColor): SimulationMove[] {
        return this.getPossibleSimulationMoves(color);
    }
    moveSimulator(move: SimulationMove): void {
        return this.simulateMove(move);
    }
    scoreGetter(color: PieceColor): number {
        return this.getScore(color);
    }
    gameIsNotOver(): boolean {
        return  this.hasKing(PieceColor.BLACK) && this.hasKing(PieceColor.WHITE);
    }

    public logNodes()
    {
        console.log(this.nodes);
    }

   /* public initFromPieces(pieces: Readonly<ChessPiece[]>)
    {
        this.createAnndInitMasters(pieces);
        this.positionByPiece.forEach((position: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            this.nodes[position.I][position.J].setOwner(key);
            this.masterById.set(key.getId(), key);
        });
    }*/
    public initFromAbstractPiece(pieces: PieceAbstraction[])
    {
        const rooks: RookNodeMaster[] = [];
        pieces.forEach( piece =>
        {
            let master: ChessNodeMaster = null;
            if (piece.type === PieceType.PAWN)
            {
                master = new PawnNodeMaster(piece.color);
            }
            else if ( piece.type  === PieceType.KING)
            {
                master = new KingNodeMaster(piece.color);
                this.kings.push(master);
            }
            else if (piece.type  === PieceType.QUEEN)
            {
                master = new QueenNodeMaster(piece.color);
            }
            else if (piece.type  === PieceType.KNIGHT)
            {
                master = new KnightNodeMaster(piece.color);
                this.knights.push(master);
            }
            else if (piece.type  === PieceType.ROOK)
            {
                master = new RookNodeMaster(piece.color);
                rooks.push(master);
            }
            else if (piece.type  === PieceType.BISHOP)
            {
                master = new BishopNodeMaster(piece.color);
            }
            if (master != null)
            {
                const position = piece.position;
                const ogPosition: ICaseBoardPosition = {I: piece.originalPosition.I, J: piece.originalPosition.J};
                master.setOriginalPosition(ogPosition);
                master.setNodeProvider(this);
                this.positionByPiece.set(master , {I: position.I, J: position.J});
                master.setHasMoved(piece.hasMoved);
            }
        });
        this.initRooks(rooks);
        this.positionByPiece.forEach((position: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            this.nodes[position.I][position.J].setOwner(key);
            this.masterById.set(key.getId(), key);
            if (key.getColor() === PieceColor.BLACK)
            {
                this.absoluteMax = key.getValue();
            }
        });
    }
    public initWithoutPiece()
    {
        // pawn init
        for (let i = 0; i < 8; ++i)
        {
            const blackPawn = new PawnNodeMaster(PieceColor.BLACK);
            const ogPosition: ICaseBoardPosition = {I: 1, J: i};
            blackPawn.setOriginalPosition(ogPosition);
            blackPawn.setNodeProvider(this);
            this.positionByPiece.set(blackPawn , {I: 1, J: i});
            blackPawn.setHasMoved(false);

            const whitePawn = new PawnNodeMaster(PieceColor.WHITE);
            const ogPosition2: ICaseBoardPosition = {I: 6, J: i};
            whitePawn.setOriginalPosition(ogPosition2);
            whitePawn.setNodeProvider(this);
            this.positionByPiece.set(whitePawn , {I: 6, J: i});
            whitePawn.setHasMoved(false);
        }
        const rooks: RookNodeMaster[] = [];
        // rook init
        for (let i = 0; i < 8; i += 7)
        {
            const blackRook = new RookNodeMaster(PieceColor.BLACK);
            const ogPosition: ICaseBoardPosition = {I: 0, J: i};
            blackRook.setOriginalPosition(ogPosition);
            blackRook.setNodeProvider(this);
            this.positionByPiece.set(blackRook , {I: 0, J: i});
            blackRook.setHasMoved(false);


            const whiteRook = new RookNodeMaster(PieceColor.WHITE);
            const ogPosition2: ICaseBoardPosition = {I: 7, J: i};
            whiteRook.setOriginalPosition(ogPosition2);
            whiteRook.setNodeProvider(this);
            this.positionByPiece.set(whiteRook , {I: 7, J: i});
            whiteRook.setHasMoved(false);
            rooks.push(blackRook);
            rooks.push(whiteRook);
        }
        this.initRooks(rooks);
        // knight init
        for (let i = 1; i < 8; i += 5)
        {
            const blackKnight = new KnightNodeMaster(PieceColor.BLACK);
            const ogPosition: ICaseBoardPosition = {I: 0, J: i};
            blackKnight.setOriginalPosition(ogPosition);
            blackKnight.setNodeProvider(this);
            this.positionByPiece.set(blackKnight , {I: 0, J: i});
            blackKnight.setHasMoved(false);

            const whiteKnight = new KnightNodeMaster(PieceColor.WHITE);
            const ogPosition2: ICaseBoardPosition = {I: 7, J: i};
            whiteKnight.setOriginalPosition(ogPosition2);
            whiteKnight.setNodeProvider(this);
            this.positionByPiece.set(whiteKnight , {I: 7, J: i});
            whiteKnight.setHasMoved(false);
            this.knights.push(blackKnight);
            this.knights.push(whiteKnight);
        }
        // bishop init
        for (let i = 2; i < 6; i += 3)
        {
            const blackBishop = new BishopNodeMaster(PieceColor.BLACK);
            const ogPosition: ICaseBoardPosition = {I: 0, J: i};
            blackBishop.setOriginalPosition(ogPosition);
            blackBishop.setNodeProvider(this);
            this.positionByPiece.set(blackBishop , {I: 0, J: i});
            blackBishop.setHasMoved(false);

            const whiteBishop = new BishopNodeMaster(PieceColor.WHITE);
            const ogPosition2: ICaseBoardPosition = {I: 7, J: i};
            whiteBishop.setOriginalPosition(ogPosition2);
            whiteBishop.setNodeProvider(this);
            this.positionByPiece.set(whiteBishop , {I: 7, J: i});
            whiteBishop.setHasMoved(false);
        }
        // king init
        const blackKing = new KingNodeMaster(PieceColor.BLACK);
        const tmpOgPosition: ICaseBoardPosition = {I: 0, J: 4};
        blackKing.setOriginalPosition(tmpOgPosition);
        blackKing.setNodeProvider(this);
        this.positionByPiece.set(blackKing , {I: 0, J: 4});
        blackKing.setHasMoved(false);
        this.kings.push(blackKing);

        const whiteKing = new KingNodeMaster(PieceColor.WHITE);
        const tmpOgPosition2: ICaseBoardPosition = {I: 7, J: 4};
        whiteKing.setOriginalPosition(tmpOgPosition2);
        whiteKing.setNodeProvider(this);
        this.positionByPiece.set(whiteKing , {I: 7, J: 4});
        whiteKing.setHasMoved(false);
        this.kings.push(whiteKing);
        // queen init
        const blackQueen = new QueenNodeMaster(PieceColor.BLACK);
        const queenOgPosition: ICaseBoardPosition = {I: 0, J: 3};
        blackQueen.setOriginalPosition(queenOgPosition);
        blackQueen.setNodeProvider(this);
        this.positionByPiece.set(blackQueen , {I: 0, J: 3});
        blackQueen.setHasMoved(false);

        const whiteQueen = new QueenNodeMaster(PieceColor.WHITE);
        const queenOgPosition2: ICaseBoardPosition = {I: 7, J: 3};
        whiteQueen.setOriginalPosition(queenOgPosition2);
        whiteQueen.setNodeProvider(this);
        this.positionByPiece.set(whiteQueen , {I: 7, J: 3});
        whiteQueen.setHasMoved(false);

        this.positionByPiece.forEach((position: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            this.nodes[position.I][position.J].setOwner(key);
            this.masterById.set(key.getId(), key);
        });
    }
    public insertNewMaster(master: ChessNodeMaster): void
    {
        if (!this.masterById.has(master.getId()))
        {
            this.masterById.set(master.getId(), master);
        }
    }
    public getMasterFromId(id: number): ChessNodeMaster
    {
        if (this.masterById.has(id))
        {
            return this.masterById.get(id);
        }
        return null;
    }
    public clone(): ChessCore
    {
        const provider = new ChessCore();
        const rooks: RookNodeMaster[] = [];
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            const master = key.clone();
            provider.positionByPiece.set(key.clone() , {I: value.I, J: value.J});
            if ( master instanceof KingNodeMaster)
            {
                provider.kings.push(master);
            }
            else if (master instanceof KnightNodeMaster)
            {
                provider.knights.push(master);
            }
            else if (master instanceof RookNodeMaster)
            {
                rooks.push(master);
            }
            provider.nodes[value.I][value.J].setOwner(master);
        });
        provider.initRooks(rooks);
        return provider;
    }
    private initNodes(): void
    {
        this.nodes = [];
        for (let i = 0; i < 8; i++)
        {
            const line: ChessNode[] = [];
            for (let j = 0; j < 8; j++)
            {
                line.push(new ChessNode(this, {I: i, J: j}, null));
            }
            this.nodes.push(line);
        }
    }

   /* private createAnndInitMasters(pieces: Readonly<ChessPiece[]>)
    {
        const rooks: RookNodeMaster[] = [];
        pieces.forEach( piece =>
        {
            if (piece.getCurrentCase() !== null && piece.getCurrentCase() !== undefined)
            {
                let master: ChessNodeMaster = null;
                if (piece instanceof TransformablePawnPiece || piece instanceof PawnPiece)
                {
                    master = new PawnNodeMaster(piece.getColor());
                }
                else if ( piece instanceof KingPiece)
                {
                    master = new KingNodeMaster(piece.getColor());
                    this.kings.push(master);
                }
                else if (piece instanceof QueenPiece)
                {
                    master = new QueenNodeMaster(piece.getColor());
                }
                else if (piece instanceof KnightPiece)
                {
                    master = new KnightNodeMaster(piece.getColor());
                    this.knights.push(master);
                }
                else if (piece instanceof RookPiece)
                {
                    master = new RookNodeMaster(piece.getColor());
                    rooks.push(master);
                }
                else if (piece instanceof BishopPiece)
                {
                    master = new BishopNodeMaster(piece.getColor());
                }
                if (master != null)
                {
                    const position = piece.getCurrentCase().getCasePosition();
                    const ogPosition: ICaseBoardPosition = {I: position.I, J: position.J};
                    master.setOriginalPosition(ogPosition);
                    master.setNodeProvider(this);
                    this.positionByPiece.set(master , {I: position.I, J: position.J});
                    master.setHasMoved(piece.getHasMovedOnce());
                }
            }
        });
        this.initRooks(rooks);
    }*/
    private initRooks(rooks: RookNodeMaster[] )
    {
        rooks.forEach(rook =>
            {
                const rookPosition = rook.getOriginalPosition();
                if (rookPosition.I === 0 && rookPosition.J === 0 )
                {
                    this.rightBlackRook = rook;
                }
                else if ( rookPosition.I === 0 && rookPosition.J === 7)
                {
                    this.leftBlackRook = rook;
                }
                else if ( rookPosition.I === 7 && rookPosition.J === 7)
                {
                    this.rightWhiteRook = rook;
                }
                else if ( rookPosition.I === 7 && rookPosition.J === 0)
                {
                    this.leftWhiteRook = rook;
                }
            });
    }

    getNode(position: ICaseBoardPosition): ChessNode
    {
        return this.nodes[position.I][position.J];
    }
    public getNodeOf(master: ChessNodeMaster): ChessNode
    {
        const position = this.positionByPiece.get(master);
        const node = this.nodes[position.I][position.J];
        return node;
    }
    public hasKing(color: PieceColor): boolean
    {
        return this.positionByPiece.has(this.getKing(color));
    }
    public getKing(color: PieceColor): KingNodeMaster
    {
        return this.kings.filter(king => king.getColor() === color)[0] as KingNodeMaster;
    }
    public getKnights(color: PieceColor): KnightNodeMaster[]
    {
        return this.knights.filter(knight => this.positionByPiece.has(knight) && knight.getColor() === color).map(knight => knight as KnightNodeMaster);
    }
    private setMaster(position: ICaseBoardPosition, master: ChessNodeMaster)
    {
        if (master !== null && this.positionByPiece.has(master))
        {
            const previousPosition = this.positionByPiece.get(master);
            this.setMaster(previousPosition, null);
            if (master instanceof PawnNodeMaster)
            {
                const hasMovedTwoSquares = Math.abs(previousPosition.I - position.I) === 2;
                (master as PawnNodeMaster).setHasMovedTwoSquares(hasMovedTwoSquares);
            }
        }
        const oldMaster = this.nodes[position.I][position.J].getOwner();
        if (oldMaster != null && master !== oldMaster)
        {
            this.positionByPiece.delete(oldMaster);
        }
        if (master != null)
        {
            this.positionByPiece.set(master, position);
        }
        this.nodes[position.I][position.J].setOwner(master);
        if (master != null && !master.hasMoved())
        {
            master.updateHasMoved();
        }
    }
    public setMasterAndUpdateBoard(position: ICaseBoardPosition, master: ChessNodeMaster)
    {
        // console.log('setting master start', performance.now());
        this.setMaster(position, master);
        // console.log('setting master loop start', performance.now());
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            if (value.I !== position.I || value.J !== position.J)
            {
                this.nodes[value.I][value.J].initNeighborhoodUnsafely();
            }
        });
        // console.log('setting master end', performance.now());
    }

    public simulateMove(simulationMove: SimulationMove)
    {
        let master = simulationMove.getMaster();
        const position = simulationMove.getPosition();
        if (master instanceof PawnNodeMaster)
        {
            if (master.isDoingEnPassantCapture(this.getNodeOf(master).getPosition(), position))
            {
                const targetPosition = {I: position.I, J: position.J};
                targetPosition.I -= master.getMvtDirection();
                this.setMasterAndUpdateBoard(targetPosition, null);
            }
            else if ((simulationMove as PawnSimulationMove).hasPromotionType())
            {
                const oldMaster = master;
                switch ((simulationMove as PawnSimulationMove).getPromotionType())
                {
                    case PieceType.KNIGHT:
                        master = new KnightNodeMaster(master.getColor());
                        break;
                    case PieceType.QUEEN:
                        master = new QueenNodeMaster(master.getColor());
                        break;
                }
                master.setHasMoved(true);
                master.setOriginalPosition(oldMaster.getOriginalPosition());
                master.setNodeProvider(this);
                this.insertNewMaster(master);
                this.setMasterAndUpdateBoard(oldMaster.getOriginalPosition(), null);
            }
        }
        else if ( master instanceof KingNodeMaster)
        {
            const previousPosition = this.getNodeOf(master).getPosition();
            const deltaJ = position.J - previousPosition.J;
            // if abs(deltaJ) != 1 it means we are doing a castling
            if (deltaJ > 1)
            {
                if (master.getColor() === PieceColor.BLACK) // black left castling
                {
                    this.setMasterAndUpdateBoard({I: 0, J: 5}, this.leftBlackRook);
                }
                else if (master.getColor() === PieceColor.WHITE) // white right castling
                {
                    this.setMasterAndUpdateBoard({I: 7, J: 5}, this.rightWhiteRook);
                }
            }
            else if (deltaJ < -1)
            {
                if (master.getColor() === PieceColor.BLACK) // black  right castling
                {
                    this.setMasterAndUpdateBoard({I: 0, J: 3}, this.rightBlackRook);
                }
                else if (master.getColor() === PieceColor.WHITE)// white left castling
                {
                    this.setMasterAndUpdateBoard({I: 7, J: 5}, this.leftWhiteRook);
                }
            }
        }
        this.setMasterAndUpdateBoard(position, master);
    }

    isValid(position: ICaseBoardPosition): boolean
    {
        return position.I >= 0 && position.I < 8 && position.J >= 0 && position.J < 8;
    }
    playerHasAMoveToDo(color: PieceColor): boolean
    {
        for (const pair of this.positionByPiece)
        {
            if  (pair[0].getColor() === color)
            {
                if (this.nodes[pair[1].I][pair[1].J].getOutnodePosition().length > 0)
                {
                    return true;
                }
            }
        }
        return false;
    }
    masterIsInDanger(master: ChessNodeMaster): boolean
    {
        const position =  this.positionByPiece.get(master);
        return this.nodes[position.I][position.J].ownerIsInDanger();
    }
    kingIsInDanger(color: PieceColor): boolean
    {
        const king = this.kings.filter(piece => piece.getColor() === color)[0];
        return this.getNodeOf(king).ownerIsInDanger();
    }
    public canMakeRightCastling(color: PieceColor): boolean
    {
       return this.canMakeARightCastling(this.kings.filter(val => val.getColor() === color)[0] as KingNodeMaster);
    }
    public canMakeARightCastling(king: NonNullable<KingNodeMaster>): boolean
    {
        let rook: ChessNodeMaster;
        if (king.getColor() === PieceColor.BLACK)
        {
            rook = this.rightBlackRook;
            return (rook !== null) && this.positionByPiece.has(rook) && !king.hasMoved() && !rook.hasMoved() && !this.getNodeOf(king).ownerIsInDanger() && this.nodes[0][1].isFree()
            && this.nodes[0][2].isFree() && this.nodes[0][3].isFree()
            && !this.nodes[0][1].nextMasterWillBeInDanger(PieceColor.BLACK) && !this.nodes[0][2].nextMasterWillBeInDanger(PieceColor.BLACK) &&
            !this.nodes[0][3].nextMasterWillBeInDanger(PieceColor.BLACK) && !this.nodes[0][4].nextMasterWillBeInDanger(PieceColor.BLACK)
            && this.rightBlackRook.positionIsSafeForTheKing({I: 0, J: 3});
        }
        else
        {
            rook = this.rightWhiteRook;
            return (rook !== null) && this.positionByPiece.has(rook) && !king.hasMoved() && !rook.hasMoved() && !this.getNodeOf(king).ownerIsInDanger() && !this.getNodeOf(king).ownerIsInDanger()
            && this.nodes[7][6].isFree() && this.nodes[7][5].isFree() && !this.nodes[7][4].nextMasterWillBeInDanger(PieceColor.WHITE)
            && !this.nodes[7][5].nextMasterWillBeInDanger(PieceColor.WHITE) && !this.nodes[7][6].nextMasterWillBeInDanger(PieceColor.WHITE)
            && this.rightWhiteRook.positionIsSafeForTheKing({I: 7, J: 5});
        }

    }
    public canMakeLeftCastling(color: PieceColor): boolean
    {
       return this.canMakeALeftCastling(this.kings.filter(val => val.getColor() === color)[0] as KingNodeMaster);
    }
    public canMakeALeftCastling(king: NonNullable<KingNodeMaster>): boolean
    {
        let rook: ChessNodeMaster;
        if (king.getColor() === PieceColor.BLACK)
        {
            rook = this.leftBlackRook;
            return (rook !== null) && this.positionByPiece.has(rook) && !king.hasMoved() && !rook.hasMoved() && this.nodes[0][6].isFree() && this.nodes[0][5].isFree()
            && !this.nodes[0][4].nextMasterWillBeInDanger(PieceColor.BLACK) && !this.nodes[0][5].nextMasterWillBeInDanger(PieceColor.BLACK)
            && !this.nodes[0][6].nextMasterWillBeInDanger(PieceColor.BLACK) && this.leftBlackRook.positionIsSafeForTheKing({I: 0, J: 5});
        }
        else
        {
            rook = this.leftWhiteRook;
            return (rook !== null) && this.positionByPiece.has(rook) && !king.hasMoved() && !rook.hasMoved() && this.nodes[7][1].isFree() && this.nodes[7][2].isFree() && this.nodes[7][3].isFree()
            && !this.nodes[7][4].nextMasterWillBeInDanger(PieceColor.WHITE) && !this.nodes[7][3].nextMasterWillBeInDanger(PieceColor.WHITE) &&
            !this.nodes[7][2].nextMasterWillBeInDanger(PieceColor.WHITE) && !this.nodes[7][1].nextMasterWillBeInDanger(PieceColor.WHITE)
            && this.leftWhiteRook.positionIsSafeForTheKing({I: 7, J: 0});
        }
    }

    public canDoEnpassantCapture(masterposition: ICaseBoardPosition, targetPosition: ICaseBoardPosition): boolean
    {
        const hunterNode = this.getNode(masterposition);
        if (!hunterNode.isFree())
        {
            return (hunterNode.getOwner() instanceof PawnNodeMaster) && (hunterNode.getOwner() as PawnNodeMaster).canDoEnPassantCapture( {I: masterposition.I, J: masterposition.J} , {I: targetPosition.I, J: targetPosition.J});
        }
        return false;
    }

    public getPossibleMoves(color: PieceColor): [ICaseBoardPosition, ChessNodeMaster][]
    {
        const moves: [ICaseBoardPosition, ChessNodeMaster][] = [];
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) => {
            if (key.getColor() === color)
            {
                this.getNode(value).getOutnodePosition().forEach( position => {
                    moves.push([position, key]);
                });
            }
        });
        return this.shuffle(moves);
    }

    public getPossibleSimulationMoves(color: PieceColor): SimulationMove[]
    {
        const bestMove: SimulationMove[] = [];
        const otherMoves: SimulationMove[] = [];
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) => {
            if (key.getColor() === color)
            {
                key.getSimulationMoves().forEach(simulationMove =>
                    {
                        // moves.push(simulationMove);
                        if (!this.getNode(simulationMove.getPosition()).isFree())
                        {
                            bestMove.push(simulationMove);
                        }
                        else
                        {
                            otherMoves.push(simulationMove);
                        }
                    });
            }
        });
        return [...bestMove, ...this.shuffle(otherMoves)];
    }

    public getMastersSummary(): PieceAbstraction[]
    {
        const pieces: PieceAbstraction[] = [];
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) => {
            pieces.push(key.summarize());
        });
        return pieces;
    }

    private shuffle(array: any[]): any[]
    {
        let currentIndex = array.length;
        let randomIndex = 0;
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
      }

    public getTotal(): number
    {
        let score = 0;
        this.positionByPiece.forEach((hostPos: ICaseBoardPosition, master: ChessNodeMaster) => {
            score += master.getValue();
        });
        return score;
    }
    public getScore(color: PieceColor): number
    {
        let score = 0;
        let opponentVal = 0;
        this.positionByPiece.forEach((hostPos: ICaseBoardPosition, master: ChessNodeMaster) => {
            if (master.getColor() === color)
            {
                score += master.getValue() + this.nodes[hostPos.I][hostPos.J].getValue();
            }
            else
            {
                opponentVal += master.getValue();
            }
        });
        if (color === PieceColor.BLACK)
        {
            score += this.absoluteMax - (Math.abs(opponentVal));
        }
        else
        {
            score -= this.absoluteMax - (Math.abs(opponentVal));
        }
        return score;
    }

    public restoreGameState(nodeStates: ChessNodeState[]): void
    {
        this.positionByPiece = new Map<ChessNodeMaster, ICaseBoardPosition>();
        nodeStates.forEach(state => {
            const position = state.getPosition();
            this.nodes[position.I][position.J].restoreState(state);
            if (!this.nodes[position.I][position.J].isFree())
            {
                this.positionByPiece.set(this.nodes[position.I][position.J].getOwner(), {I: position.I, J: position.J});
            }
        });
    }

    public saveGameState(): ChessNodeState[]
    {
        const states: ChessNodeState[] = [];
        this.nodes.forEach(row => {
            row.forEach(node => {
                states.push(node.getState());
            });
        });
        return states;
    }

    public flushUnusedMasters()
    {
        const idsToKeep: number[] = [];
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            idsToKeep.push(key.getId());
        });
        Array.from(this.masterById.keys()).filter((id) => !idsToKeep.includes(id)).forEach((idToRemove) => {
            this.masterById.delete(idToRemove);
        });
    }

    public notifyPromotion(pawnPosition: ICaseBoardPosition, newType: PieceType, pawnColor: PieceColor): void
    {
        const oldMaster = this.getNode(pawnPosition).getOwner();
        let master: ChessNodeMaster;
        switch (newType)
        {
            case PieceType.BISHOP:
                master = new BishopNodeMaster(pawnColor);
                break;
            case PieceType.QUEEN:
                master = new QueenNodeMaster(pawnColor);
                break;
            case PieceType.ROOK:
                master = new RookNodeMaster(pawnColor);
                break;
            case PieceType.KNIGHT:
                master = new KnightNodeMaster(pawnColor);
                break;
        }
        master.setHasMoved(true);
        master.setOriginalPosition(oldMaster.getOriginalPosition());
        master.setNodeProvider(this);
        this.insertNewMaster(master);
        this.setMasterAndUpdateBoard(pawnPosition, master);
    }
    notifyMove(oldPosition: ICaseBoardPosition, newPosition: ICaseBoardPosition): void
    {
        const quittingNode = this.getNode(oldPosition);
        const master = quittingNode.getOwner();
        const receivingNode = this.getNode(newPosition);
        this.setMasterAndUpdateBoard(receivingNode.getPosition(), master);
    }

    public getBestMovePossible(color: PieceColor): SimulationMove
    {
        const minimaxRoot = new MinimaxTreeNode(null, this, color, 4 , null);
        const choosenMove = minimaxRoot.getElectedMove();
        this.flushUnusedMasters();
        return choosenMove;
    }
}

