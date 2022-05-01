import { ICaseBoardPosition } from '../board/ICaseBoardPosition';
import { PieceColor } from '../pieces/PieceColor';
import { ChessNodeMaster, ChessNodeMasterState } from './chessnodemaster';
import { ChessCore } from './chessCore';
import { ChessNodeWeightGiver } from './chessNodeWeightsGiver';
import { PawnNodeMaster } from './pawnnodemaster';

export class ChessNode
{
    private static weightMap: ChessNodeWeightGiver = new ChessNodeWeightGiver();
    private outNodes: Set<ChessNode> = new Set<ChessNode>();
    private inNodes: Set<ChessNode> = new Set<ChessNode>();
    private nodeProvider: ChessCore;
    private nodePosition: ICaseBoardPosition;
    private master: ChessNodeMaster = null;
    constructor(nodeProvider: ChessCore, nodePosition: ICaseBoardPosition, master: ChessNodeMaster)
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
    getOutnodePosition(): ICaseBoardPosition[]
    {
        const positions: ICaseBoardPosition[] = [];
        this.outNodes.forEach(node => positions.push({I: node.nodePosition.I, J: node.nodePosition.J}));
        return positions;
    }
    getInnodePosition(): ICaseBoardPosition[]
    {
        const positions: ICaseBoardPosition[] = [];
        this.inNodes.forEach(node => positions.push({I: node.nodePosition.I, J: node.nodePosition.J}));
        return positions;
    }
    public getProvider(): ChessCore
    {
        return this.nodeProvider;
    }

    public getState(): ChessNodeState
    {
        return new ChessNodeState(this);
    }

    public restoreState(state: ChessNodeState): void
    {
        this.outNodes = new Set<ChessNode>();
        this.inNodes = new Set<ChessNode>();
        state.getInNodesPositions().forEach(position =>
        {
            this.inNodes.add(this.nodeProvider.getNode(position));
        });
        state.getOutNodesPositions().forEach(position =>
        {
            this.outNodes.add(this.nodeProvider.getNode(position));
        });
        if (state.hasMasterState())
        {
            this.master = this.nodeProvider.getMasterFromId(state.getMasterState().getMasterId());
            this.master.restoreState(state.getMasterState());
        }
        else
        {
            this.master = null;
        }
    }
    public getValue(): number
    {
        return ChessNode.weightMap.getChessNodeValue(this.master, this.getPosition());
    }
}

export class ChessNodeState
{
    private position: ICaseBoardPosition;
    private outNodes: ICaseBoardPosition[] = [];
    private inNodes: ICaseBoardPosition[] = [];
    private readonly masterState: ChessNodeMasterState = null;
    constructor(node: ChessNode)
    {
       this.position = node.getPosition();
       this.outNodes = node.getOutnodePosition();
       this.inNodes = node.getInnodePosition();
       if (!node.isFree())
       {
            this.masterState = node.getOwner().getState();
       }
    }
    public getOutNodesPositions(): ICaseBoardPosition[]
    {
        return this.outNodes;
    }
    public getInNodesPositions(): ICaseBoardPosition[]
    {
        return this.inNodes;
    }
    public getMasterState(): ChessNodeMasterState
    {
        return this.masterState;
    }
    public hasMasterState(): boolean
    {
        return this.masterState !== null;
    }
    public getPosition(): ICaseBoardPosition
    {
        return this.position;
    }
}
