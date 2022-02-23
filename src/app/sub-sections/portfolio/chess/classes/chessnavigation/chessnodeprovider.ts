import { ICaseBoardPosition } from '../board/chessCase';
import { BishopPiece } from '../pieces/bishoppiece';
import { ChessPiece, PieceColor } from '../pieces/chesspiece';
import { KingPiece } from '../pieces/kingpiece';
import { KnightPiece } from '../pieces/knightpiece';
import { PawnPiece } from '../pieces/pawnpiece';
import { QueenPiece } from '../pieces/queenpiece';
import { RookPiece } from '../pieces/rookpiece';
import { TransformablePawnPiece } from '../pieces/transformablePawnPiece';
import { BishopNodeMaster } from './bishopnodemaster';
import { ChessNode, ChessNodeState } from './chessnode';
import { ChessNodeMaster } from './chessnodemaster';
import { KingNodeMaster } from './kingnodemaster';
import { KnightNodeMaster } from './knightNodeMaster';
import { PawnNodeMaster } from './pawnnodemaster';
import { QueenNodeMaster } from './queennodemaster';
import { RookNodeMaster } from './rooknodemaster';

export class ChessNodeProvider
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
    constructor()
    {
        this.initNodes();
    }

    public initFromPieces(pieces: Readonly<ChessPiece[]>)
    {
        this.createAnndInitMasters(pieces);
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
    public clone(): ChessNodeProvider
    {
        const provider = new ChessNodeProvider();
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

    private createAnndInitMasters(pieces: Readonly<ChessPiece[]>)
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
    }
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
    public setMasterAndUpdateBoard(position: ICaseBoardPosition, master: ChessNodeMaster)
    {
        if (master !== null && this.positionByPiece.has(master))
        {
            const previousPosition = this.positionByPiece.get(master);
            this.setMasterAndUpdateBoard(previousPosition, null);
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
        // update neighborhood
        /*const positions: ICaseBoardPosition[] = [];
        positions.push({I: position.I - 1, J: position.J});
        positions.push({I: position.I + 1, J: position.J});
        positions.push({I: position.I , J: position.J - 1});
        positions.push({I: position.I , J: position.J + 1});
        positions.push({I: position.I - 1, J: position.J - 1});
        positions.push({I: position.I - 1, J: position.J + 1});
        positions.push({I: position.I + 1, J: position.J - 1});
        positions.push({I: position.I + 1, J: position.J + 1});
        const nodesToKeep = positions.filter(pos => this.isValid(pos)).map(pos => this.nodes[pos.I][pos.J]);
        nodesToKeep.filter(node => !node.isFree()).forEach( node => node.initNeighborhoodUnsafely());
        nodesToKeep.filter(node => node.isFree()).forEach( node => node.updateInNodes());
        this.knights.filter(knight => this.positionByPiece.has(knight)).forEach(knight => this.getNodeOf(knight).initNeighborhoodUnsafely());*/
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) =>
        {
            if (value.I !== position.I || value.J !== position.J)
            {
                this.nodes[value.I][value.J].initNeighborhoodUnsafely();
            }
        });
    }

    isValid(position: ICaseBoardPosition): boolean
    {
        return position.I >= 0 && position.I < 8 && position.J >= 0 && position.J < 8;
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
        return moves;
    }

    public getTotal(): number
    {
        let score = 0;
        this.positionByPiece.forEach((value: ICaseBoardPosition, key: ChessNodeMaster) => {
            score += key.getValue();
        });
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
}

class SimulationMove
{
    private principalMaster: ChessNodeMaster = null;
    private previousPrincipalMasterPosition: ICaseBoardPosition;
    private newPosition: ICaseBoardPosition;
    private replacedMaster: ChessNodeMaster = null;
    constructor(principalMaster: ChessNodeMaster, previousPrincipalMasterPosition: ICaseBoardPosition, newPosition: ICaseBoardPosition, replacedMaster: ChessNodeMaster)
    {
        this.principalMaster = principalMaster;
        this.previousPrincipalMasterPosition = previousPrincipalMasterPosition;
        this.newPosition = newPosition;
        this.replacedMaster = replacedMaster;
    }

    public getPrincipalMaster(): ChessNodeMaster
    {
        return this.principalMaster;
    }

    public getPreviousPosition(): ICaseBoardPosition
    {
        return this.previousPrincipalMasterPosition;
    }

    public getPosition(): ICaseBoardPosition
    {
        return this.newPosition;
    }

    public getReplacedMaster(): ChessNodeMaster
    {
        return this.replacedMaster;
    }
}
