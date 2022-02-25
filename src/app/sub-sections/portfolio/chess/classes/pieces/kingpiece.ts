import * as THREE from 'three';
import { ICaseBoardPosition, IVisitedCase } from '../board/chessCase';
import { IKingSpecialRequestSupplier, IPiecesRequestSupplier} from '../chessnavigation/chessnavigationmanager';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';

export class KingPiece extends ChessPiece
{
    private specialRequestsSupplier: IKingSpecialRequestSupplier;
    private readonly leftCastlingPosition: ICaseBoardPosition;
    private readonly rightCastlingPosition: ICaseBoardPosition;
    constructor(color: PieceColor)
    {
        super('../../../../../../../assets/chess/low_poly_king/scene.gltf', color);
        if (color === PieceColor.BLACK)
        {
            this.leftCastlingPosition = {I: 0, J: 6};
            this.rightCastlingPosition = {I: 0, J: 2};
        }
        else
        {
            this.leftCastlingPosition = {I: 7, J: 2};
            this.rightCastlingPosition = {I: 7, J: 6};
        }
    }
    animatedVisit(host: IVisitedCase): Promise<void>
    {
        return new Promise<void>(resolve =>
            {
                ChessPiece.AUDIO_MVT_PLAYER.playSound(false);
                this.hasMovedOnce = (this.currentCase != null);
                this.captureHostVisitorIfNeeded(host);
                const isDoingLeftCastling = this.isDoingALeftCastling(host);
                let isDoingRightCastling = false;
                if (!isDoingLeftCastling)
                {
                    isDoingRightCastling = this.isDoingARightCastling(host);
                }
                this.positionAvailabilityChecker.notifyMove(this, host.getCasePosition());
                this.quitCase();
                this.currentCase = host;
                this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0))); // temporary
                if (isDoingLeftCastling)
                {
                    this.specialRequestsSupplier.realizeAnimatedRookLeftCastling(this.color).then(() =>
                    {
                        resolve();
                        return;
                    });
                }
                else if (isDoingRightCastling)
                {
                    this.specialRequestsSupplier.realizeAnimatedRookRightCastling(this.color).then(() =>
                    {
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
    }
    firstVisit( host: IVisitedCase): void
    {
        this.hasMovedOnce = (this.currentCase != null);
        // this.captureHostVisitorIfNeeded(host);
        this.quitCase();
        this.currentCase = host;
        this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
        /*if (this.isDoingALeftCastling(host))
        {
            this.specialRequestsSupplier.realizeRookLeftCastling(this.color);
        }
        else if (this.isDoingARightCastling(host))
        {
            this.specialRequestsSupplier.realizeRookRightCastling(this.color);
        }*/
    }
    private isDoingALeftCastling(host: IVisitedCase): boolean
    {
        const hostPosition = host.getCasePosition();
        return this.specialRequestsSupplier.canMakeALeftCastling(this) && (hostPosition.I === this.leftCastlingPosition.I) && (hostPosition.J === this.leftCastlingPosition.J);
    }
    private isDoingARightCastling(host: IVisitedCase): boolean
    {
        const hostPosition = host.getCasePosition();
        return this.specialRequestsSupplier.canMakeARightCastling(this) && (hostPosition.I === this.rightCastlingPosition.I) && (hostPosition.J === this.rightCastlingPosition.J);
    }
    public setNavigationChecker( mvtValidator: IPiecesRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
        this.specialRequestsSupplier = mvtValidator as IKingSpecialRequestSupplier;
    }
    public getType(): Readonly<PieceType>
    {
        return PieceType.KING;
    }
}
