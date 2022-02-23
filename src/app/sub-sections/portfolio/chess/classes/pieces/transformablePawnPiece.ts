import { ChessCase, ICaseBoardPosition, IVisitedCase } from '../board/chessCase';
import { IPawnSpecialRequestSupplier } from '../chessnavigation/chessnavigationmanager';
import { ChessPlayer} from '../player/chessplayer';
import { HumanChessPlayer } from '../player/humanchessplayer';
import { BishopPiece } from './bishoppiece';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';
import { KnightPiece } from './knightpiece';
import { PawnPiece } from './pawnpiece';
import { QueenPiece } from './queenpiece';
import { RookPiece } from './rookpiece';

export class TransformablePawnPiece extends ChessPiece
{
    private innerPiece: ChessPiece;
    private bishop: BishopPiece;
    private queen: QueenPiece;
    private rook: RookPiece;
    private knight: KnightPiece;
    private startingPosition: ICaseBoardPosition;
    constructor(color: PieceColor)
    {
        super('', color);
        this.rook = new RookPiece(color);
        this.queen = new QueenPiece(color);
        this.bishop = new BishopPiece(color);
        this.innerPiece = new PawnPiece(color);
        this.knight = new KnightPiece(color);
    }
    private promoteAs(type: PieceType)
    {
        const previousModel = this.innerPiece.getModel();
        previousModel.visible = false;
        if (this.getOwner() instanceof HumanChessPlayer)
        {
            this.innerPiece.onDeselect();
        }
        const currentCase = this.innerPiece.getCurrentCase();
        const owner = this.innerPiece.getOwner();
        switch (type)
        {
            case PieceType.BISHOP:
                this.innerPiece = this.bishop;
                break;
            case PieceType.QUEEN:
                this.innerPiece = this.queen;
                break;
            case PieceType.ROOK:
                this.innerPiece = this.rook;
                break;
            case PieceType.KNIGHT:
                this.innerPiece = this.knight;
                break;
        }
        currentCase.acceptVisitor(this.innerPiece);
        this.innerPiece.setOwner(owner);
        this.innerPiece.getModel().visible = true;
        (this.positionAvailabilityChecker as IPawnSpecialRequestSupplier).notifyPromotion(this, type);
        if (this.getOwner() instanceof HumanChessPlayer)
        {
            this.innerPiece.onOutline();
        }
    }
    public onDeselect(): void
    {
        this.innerPiece.onDeselect();
    }
    public onOutline(): void
    {
        this.innerPiece.onOutline();
    }
    public isFriendWith(piece: ChessPiece): boolean
    {
        return this.innerPiece.isFriendWith(piece);
    }
    public animatedVisit(host: IVisitedCase): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                this.innerPiece.animatedVisit(host).then(() =>
                {
                    if (this.shouldBePromoted())
                    {
                        this.innerPiece.getOwner().selectPawnPromotionType(host.getCasePosition()).then((typeToPromoteTo) =>
                        {
                            this.promoteAs(typeToPromoteTo);
                            resolve();
                            return;
                        });
                    }
                    else
                    {
                        resolve();
                        return;
                    }
                });
            });
    }
    public firstVisit( host: IVisitedCase): void
    {
        if (!this.innerPiece.getHasMovedOnce())
        {
            this.startingPosition = host.getCasePosition();
        }
        this.innerPiece.firstVisit(host);
    }
    public quitCase(): void
    {
        this.innerPiece.quitCase();
    }
    public getPossibleDestinations(): ICaseBoardPosition[]
    {
        return this.innerPiece.getPossibleDestinations();
    }
    public init(): Promise<void>
    {
        return new Promise<void>(resolve =>
        {
            const promises: Promise<void>[] = [];
            promises.push(this.innerPiece.init());
            promises.push(this.knight.init());
            promises.push(this.queen.init());
            promises.push(this.rook.init());
            promises.push(this.bishop.init());
            Promise.all(promises).then(() =>
            {
                this.knight.getModel().rotateY(Math.PI);
                this.knight.getModel().visible = false;
                this.queen.getModel().visible = false;
                this.rook.getModel().visible = false;
                this.bishop.getModel().visible = false;
                resolve();
                return;
            });
        });
    }
    public setNavigationChecker(mvtValidator: IPawnSpecialRequestSupplier): void
    {
        this.innerPiece.setNavigationChecker(mvtValidator);
        this.bishop.setNavigationChecker(mvtValidator);
        this.queen.setNavigationChecker(mvtValidator);
        this.knight.setNavigationChecker(mvtValidator);
        this.rook.setNavigationChecker(mvtValidator);
        this.positionAvailabilityChecker = mvtValidator;
    }
    public canJumpOverOtherPieces(): boolean
    {
        return this.innerPiece.canJumpOverOtherPieces();
    }
    public getHasMovedOnce(): boolean
    {
        return this.innerPiece.getHasMovedOnce();
    }
    public hasSameColor(piece: ChessPiece): boolean
    {
        return this.innerPiece.hasSameColor(piece);
    }
    public hasColor(color: PieceColor): boolean
    {
        return this.innerPiece.hasColor(color);
    }
    public getModel(): THREE.Object3D
    {
        return this.innerPiece.getModel();
    }
    public getAdditionalPieces(): ChessPiece[]
    {
        return [this.knight, this.queen, this.rook, this.bishop];
    }
    public setOwner(player: ChessPlayer): void
    {
        this.innerPiece.setOwner(player);
    }
    public getOwner(): ChessPlayer
    {
        return this.innerPiece.getOwner();
    }
    public getCurrentCase(): Readonly<ChessCase>
    {
        return this.innerPiece.getCurrentCase();
    }
    public isVisible(): boolean
    {
        return this.innerPiece.isVisible();
    }
    public getType(): Readonly<PieceType>
    {
        return this.innerPiece.getType();
    }
    public getHasMovedTwoSquares(): boolean
    {
        return (this.innerPiece instanceof PawnPiece) && (this.innerPiece as PawnPiece).getHasMovedTwoSquares();
    }
    private shouldBePromoted(): boolean
    {
        if (this.innerPiece.getType() !== PieceType.PAWN)
        {
            return false;
        }
        if (this.startingPosition.I === 1)
        {
            return this.getCurrentCase().getCasePosition().I === 7;
        }
        else
        {
            return this.getCurrentCase().getCasePosition().I === 0;
        }
    }
}


