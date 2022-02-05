import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor } from '../pieces/chesspiece';
import { ChessNodeMaster } from './chessnodemaster';
import { ChessNodeProvider } from './chessnodeprovider';
import { PawnNodeMaster } from './pawnnodemaster';

export class ChessNode
{
    private outNodes: Set<ChessNode> = new Set<ChessNode>();
    private inNodes: Set<ChessNode> = new Set<ChessNode>();
    private nodeProvider: ChessNodeProvider;
    private nodePosition: ICaseBoardPosition;
    private master: ChessNodeMaster = null;
    constructor(nodeProvider: ChessNodeProvider, nodePosition: ICaseBoardPosition, master: ChessNodeMaster)
    {
        this.nodeProvider = nodeProvider;
        this.nodePosition = nodePosition;
        if (master !== null)
        {
            this.setOwner(master);
        }
    }
    getPosition(): ICaseBoardPosition
    {
        return {I: this.nodePosition.I, J: this.nodePosition.J};
    }
    setOwner(master: ChessNodeMaster): void
    {
        // console.log('setting master', this, master);
        const previousMaster = this.master;
        if (master !== null && master instanceof PawnNodeMaster && !master.hasMoved())
        {
            const oldPosition = this.nodeProvider.getNodeOf(master).getPosition();
            const hasMovedTwoSquares = Math.abs(oldPosition.I - this.getPosition().I) === 2;
            (master as PawnNodeMaster).setHasMovedTwoSquares(hasMovedTwoSquares);
        }
        this.master = master;
        this.setNeighborhood();
        if ((previousMaster !== null && this.master === null) || (previousMaster === null && this.master !== null))
        {
            this.updateInNodes();
        }
    }
    setMasterUnsafely(master: ChessNodeMaster): void
    {
        this.master = master;
    }
    initNeighborhoodUnsafely()
    {
        this.setNeighborhood();
    }

    getOwner(): ChessNodeMaster
    {
        return this.master;
    }
    private setNeighborhood()
    {
       //  console.log('setting neighborhood', this.getPosition());
        this.outNodes.forEach(neighbor =>
            {
                neighbor.inNodes.delete(this);
            });
        this.outNodes = null;
        this.outNodes = new Set<ChessNode>();
        if (this.master != null)
        {
            this.master.getPositions().forEach(position => {
                const neighbor = this.nodeProvider.getNode(position);
                this.outNodes.add(neighbor);
                neighbor.inNodes.add(this);
            });
        }
    }
    updateInNodes()
    {
        // console.log('updating in nodes', this.getPosition(), this.inNodes);
        const inNodesToUpdate = new Set<ChessNode>();
        this.inNodes.forEach(node => inNodesToUpdate.add(node));
        inNodesToUpdate.forEach(node => node.setNeighborhood());
    }

    ownerIsInDanger(): boolean
    {
        for (const node of this.inNodes)
        {
            if (node.master !== null && node.master.getColor() !== this.master.getColor())
            {
                return true;
            }
        }
        return false;
    }
    nextMasterWillBeInDanger(color: PieceColor): boolean
    {
        if (this.inNodes.size > 0)
        {
            for (const node of this.inNodes)
            {
                if (node.master !== null && node.master.getColor() !== color)
                {
                    return true;
                }
            }
        }
        return false;
    }
    isFree(): boolean
    {
        return this.master === null;
    }
    isOccupiedByOpponent(color: PieceColor): boolean
    {
        if (this.master !== null && this.master !== undefined)
        {
            return this.master.getColor() !== color;
        }
        return false;
    }
    public getProvider(): ChessNodeProvider
    {
        return this.nodeProvider;
    }
}
