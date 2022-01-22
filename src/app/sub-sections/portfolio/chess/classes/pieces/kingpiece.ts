import * as THREE from 'three';
import { ICaseBoardPosition, IVisitedCase } from '../board/chessCase';
import { IKingSpecialRequestSupplier, IPiecesRequestSupplier} from '../board/chessmovesmanager';
import { ChessPiece, PieceColor, PieceType } from './chesspiece';

export class KingPiece extends ChessPiece
{
    private specialRequestsSupplier: IKingSpecialRequestSupplier;
    private readonly leftCastlingPosition: ICaseBoardPosition;
    private readonly rightCastlingPosition: ICaseBoardPosition;
    private canDoAleftCastling = false;
    private canDoARightCastling = false;
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
                this.quitCase();
                this.currentCase = host;
                this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0))); // temporary
                if (this.isDoingALeftCastling(host))
                {
                    this.specialRequestsSupplier.realizeAnimatedRookLeftCastling(this.color).then(() =>
                    {
                        resolve();
                        return;
                    });
                }
                else if (this.isDoingARightCastling(host))
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
        ChessPiece.AUDIO_MVT_PLAYER.playSound(false);
        this.hasMovedOnce = (this.currentCase != null);
        this.captureHostVisitorIfNeeded(host);
        this.quitCase();
        this.currentCase = host;
        this.set3DPosition(this.currentCase.getCase3dPosition().add(new THREE.Vector3(0, 30, 0)));
        if (this.isDoingALeftCastling(host))
        {
            this.specialRequestsSupplier.realizeRookLeftCastling(this.color);
        }
        else if (this.isDoingARightCastling(host))
        {
            this.specialRequestsSupplier.realizeRookRightCastling(this.color);
        }
    }
    private isDoingALeftCastling(host: IVisitedCase): boolean
    {
        const hostPosition = host.getCasePosition();
        return (hostPosition.I === this.leftCastlingPosition.I) && (hostPosition.J === this.leftCastlingPosition.J);
    }
    private isDoingARightCastling(host: IVisitedCase): boolean
    {
        const hostPosition = host.getCasePosition();
        return (hostPosition.I === this.rightCastlingPosition.I) && (hostPosition.J === this.rightCastlingPosition.J);
    }
    public setNavigationChecker( mvtValidator: IPiecesRequestSupplier): void
    {
        this.positionAvailabilityChecker = mvtValidator;
        this.specialRequestsSupplier = mvtValidator as IKingSpecialRequestSupplier;
    }
    getPossibleDestinations(): ICaseBoardPosition[]
    {
        let possiblesMoves: ICaseBoardPosition[] = [];
        let possiblePosition = this.currentCase.getCasePosition();
        //
        possiblePosition.I -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I -= 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J -= 1;
        possiblesMoves.push(possiblePosition);
        //
        possiblePosition = this.currentCase.getCasePosition();
        possiblePosition.I += 1;
        possiblePosition.J += 1;
        possiblesMoves.push(possiblePosition);

        possiblesMoves = possiblesMoves.filter(position => this.isAValidPosition(position) && //
        ( this.positionAvailabilityChecker.caseIsEmpty(position) || this.positionAvailabilityChecker.positionOccupiedByOpponent(this, position)));

        if (!this.hasMovedOnce)
        {
            this.canDoARightCastling = this.specialRequestsSupplier.canMakeARightCastling(this);
            this.canDoAleftCastling = this.specialRequestsSupplier.canMakeALeftCastling(this);
        }
        else
        {
            this.canDoARightCastling = false;
            this.canDoAleftCastling = false;
        }
        // castling search 1
        if (this.canDoARightCastling)
        {
            possiblesMoves.push({I: this.rightCastlingPosition.I, J: this.rightCastlingPosition.J});
        }
        // castling search 2
        if (this.canDoAleftCastling)
        {
            possiblesMoves.push({I: this.leftCastlingPosition.I, J: this.leftCastlingPosition.J});
        }
        return possiblesMoves;
    }

    public getType(): Readonly<PieceType>
    {
        return PieceType.KING;
    }
}
