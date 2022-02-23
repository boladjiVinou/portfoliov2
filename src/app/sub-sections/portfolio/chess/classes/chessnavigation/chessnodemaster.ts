import { ICaseBoardPosition } from '../board/chessCase';
import { PieceColor, PieceType } from '../pieces/chesspiece';
import { ChessNode } from './chessnode';
import { ChessNodeProvider } from './chessnodeprovider';
import { KingNodeMaster } from './kingnodemaster';
import { PawnNodeMaster } from './pawnnodemaster';

export abstract class ChessNodeMaster
{
    private static idCounter = 0;
    protected color: PieceColor;
    protected nodeProvider: ChessNodeProvider;
    protected originalPosition: ICaseBoardPosition;
    protected hasMovedOnce = false;
    protected chessType: Readonly<PieceType>;
    protected value: number;
    private readonly id: number;
    constructor(color: PieceColor)
    {
        this.color = color;
        this.value = (this.color === PieceColor.WHITE) ? -1 : 1;
        this.id = ++ChessNodeMaster.idCounter;
    }
    public abstract getPositions(): ICaseBoardPosition[];
    public abstract clone(): ChessNodeMaster;
    public getId(): number
    {
        return this.id;
    }
    public getColor(): PieceColor
    {
        return this.color;
    }
    public setHasMoved(hasMoved: boolean): void
    {
        this.hasMovedOnce = hasMoved;
    }
    public setNodeProvider(provider: ChessNodeProvider)
    {
        this.nodeProvider = provider;
    }
    public setOriginalPosition(position: ICaseBoardPosition)
    {
        this.originalPosition = position;
    }
    public getOriginalPosition(): ICaseBoardPosition
    {
        return {I: this.originalPosition.I, J: this.originalPosition.J};
    }
    public getType(): Readonly<PieceType>
    {
        return this.chessType;
    }
    public hasMoved(): boolean
    {
        if (this.hasMovedOnce)
        {
            return true;
        }
        else
        {
            const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
            this.hasMovedOnce = ( currentPosition.I !== this.originalPosition.I || currentPosition.J !== this.originalPosition.J);
            return this.hasMovedOnce;
        }
    }

    protected isAValidPosition(position: ICaseBoardPosition)
    {
        return position.I >= 0 && position.I < 8 && position.J >= 0 && position.J < 8;
    }

    public positionIsSafeForTheKing(position: ICaseBoardPosition): boolean
    {
        const currentPosition = this.nodeProvider.getNodeOf(this).getPosition();
        const king = this.nodeProvider.getKing(this.color);
        let kingPosition: ICaseBoardPosition;
        try
        {
            if (this.chessType !== PieceType.KING)
            {
                kingPosition = this.nodeProvider.getNodeOf(king).getPosition();
            }
            else
            {
                kingPosition = position;
            }
        }
        catch (error)
        {
            return true;
        }
        const nodeIsFree = (node: ChessNode) => {
            const tmpPos = node.getPosition();
            if (tmpPos.I === position.I && tmpPos.J === position.J)
            {
                return false;
            }
            if (tmpPos.I === currentPosition.I && tmpPos.J === currentPosition.J)
            {
                return true;
            }
            return node.isFree();
        };
        const nodeIsOccupiedByOpponent = (node: ChessNode) =>
        {
            const tmpPos = node.getPosition();
            if (tmpPos.I === position.I && tmpPos.J === position.J)
            {
                return false;
            }
            return node.isOccupiedByOpponent(this.color);
        };
        // verticals
        for (let i = kingPosition.I + 1; i < 8; i++)
        {
            const node = this.nodeProvider.getNode({I: i, J: kingPosition.J});
            if (this.opponentQueenOrRookIsThere({I: i, J: kingPosition.J}, nodeIsFree, nodeIsOccupiedByOpponent))
            {
                return false;
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
        }
        for (let i = kingPosition.I - 1; i >= 0; i--)
        {
            const node = this.nodeProvider.getNode({I: i, J: kingPosition.J});
            if (this.opponentQueenOrRookIsThere({I: i, J: kingPosition.J}, nodeIsFree, nodeIsOccupiedByOpponent))
            {
                return false;
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
        }
        // horizontals
        for (let j = kingPosition.J + 1; j < 8; j++)
        {
            const node = this.nodeProvider.getNode({I: kingPosition.I, J: j});
            if (this.opponentQueenOrRookIsThere({I: kingPosition.I, J: j}, nodeIsFree, nodeIsOccupiedByOpponent))
            {
                return false;
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
        }
        for (let j = kingPosition.J - 1; j >= 0; j--)
        {
            const node = this.nodeProvider.getNode({I: kingPosition.I, J: j});
            if (this.opponentQueenOrRookIsThere({I: kingPosition.I, J: j}, nodeIsFree, nodeIsOccupiedByOpponent))
            {
                return false;
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
        }
        // diagonals
        let x = kingPosition.I - 1;
        let y = kingPosition.J - 1;
        let distance = 0;
        while (x >= 0 && x < 8 && y >= 0 && y < 8)
        {
            ++distance;
            const node = this.nodeProvider.getNode({I: x , J: y});
            if (!nodeIsFree(node) && nodeIsOccupiedByOpponent(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.BISHOP)
                {
                    return false;
                }
                else if (distance === 1 && nodeOwner.getType() === PieceType.PAWN && (nodeOwner as PawnNodeMaster).getMvtDirection() === 1)
                {
                    return false;
                }
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
            x -= 1;
            y -= 1;
        }
        x = kingPosition.I - 1;
        y = kingPosition.J + 1;
        distance = 0;
        while (x >= 0 && x < 8 && y >= 0 && y < 8)
        {
            ++distance;
            const node = this.nodeProvider.getNode({I: x , J: y});
            if (!nodeIsFree(node) && nodeIsOccupiedByOpponent(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.BISHOP)
                {
                    return false;
                }
                else if (distance === 1 && nodeOwner.getType() === PieceType.PAWN && (nodeOwner as PawnNodeMaster).getMvtDirection() === 1)
                {
                    return false;
                }
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
            x -= 1;
            y += 1;
        }
        x = kingPosition.I + 1;
        y = kingPosition.J + 1;
        while (x >= 0 && x < 8 && y >= 0 && y < 8)
        {
            ++distance;
            const node = this.nodeProvider.getNode({I: x , J: y});
            if (!nodeIsFree(node) && nodeIsOccupiedByOpponent(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.BISHOP)
                {
                    return false;
                }
                else if (distance === 1 && nodeOwner.getType() === PieceType.PAWN && (nodeOwner as PawnNodeMaster).getMvtDirection() === -1)
                {
                    return false;
                }
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
            x += 1;
            y += 1;
        }
        x = kingPosition.I + 1;
        y = kingPosition.J - 1;
        while (x >= 0 && x < 8 && y >= 0 && y < 8)
        {
            ++distance;
            const node = this.nodeProvider.getNode({I: x , J: y});
            if (!nodeIsFree(node) && nodeIsOccupiedByOpponent(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.BISHOP)
                {
                    return false;
                }
                else if (distance === 1 && nodeOwner.getType() === PieceType.PAWN && (nodeOwner as PawnNodeMaster).getMvtDirection() === -1)
                {
                    return false;
                }
            }
            else if (!nodeIsFree(node))
            {
                break;
            }
            x += 1;
            y -= 1;
        }

        x = kingPosition.I - 2;
        y = kingPosition.J - 1;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I - 2;
        y = kingPosition.J + 1;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I + 2;
        y = kingPosition.J - 1;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I + 2;
        y = kingPosition.J + 1;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I - 1;
        y = kingPosition.J - 2;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I - 1;
        y = kingPosition.J + 2;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I + 1;
        y = kingPosition.J - 2;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        x = kingPosition.I + 1;
        y = kingPosition.J + 2;
        if (this.opponentKnightIsThere({I: x, J: y}, nodeIsFree, nodeIsOccupiedByOpponent))
        {
            return false;
        }
        return true;
    }
    private opponentKnightIsThere(positionToInspect: ICaseBoardPosition, nodeIsFreeFct: (node: ChessNode) => boolean  , nodeIsOccupiedByOpponentFct: (node: ChessNode) => boolean): boolean
    {
        if (positionToInspect.I >= 0 && positionToInspect.I < 8 && positionToInspect.J >= 0 && positionToInspect.J < 8)
        {
            const node = this.nodeProvider.getNode({I: positionToInspect.I , J: positionToInspect.J});
            if (!nodeIsFreeFct(node) && nodeIsOccupiedByOpponentFct(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.KNIGHT)
                {
                    return true;
                }
            }
        }
        return false;
    }
    private opponentQueenOrRookIsThere(positionToInspect: ICaseBoardPosition, nodeIsFreeFct: (node: ChessNode) => boolean  , nodeIsOccupiedByOpponentFct: (node: ChessNode) => boolean): boolean
    {
        if (positionToInspect.I >= 0 && positionToInspect.I < 8 && positionToInspect.J >= 0 && positionToInspect.J < 8)
        {
            const node = this.nodeProvider.getNode({I: positionToInspect.I , J: positionToInspect.J});
            if (!nodeIsFreeFct(node) && nodeIsOccupiedByOpponentFct(node))
            {
                const nodeOwner = node.getOwner();
                if (nodeOwner.getType() === PieceType.ROOK || nodeOwner.getType() === PieceType.QUEEN)
                {
                    return true;
                }
            }
        }
        return false;
    }
    public getValue(): number
    {
        return this.value;
    }
    public getState(): ChessNodeMasterState
    {
        return new ChessNodeMasterState(this);
    }
    public restoreState(state: ChessNodeMasterState): void
    {
        this.hasMovedOnce = state.getHasMoved();
    }
}

export class ChessNodeMasterState
{
    private readonly hasMovedOnce: boolean;
    private readonly masterId: number;
    constructor(master: ChessNodeMaster)
    {
        this.hasMovedOnce = master.hasMoved();
        this.masterId = master.getId();
    }
    public getHasMoved(): boolean
    {
        return this.hasMovedOnce;
    }
    public getMasterId(): number
    {
        return this.masterId;
    }
}
