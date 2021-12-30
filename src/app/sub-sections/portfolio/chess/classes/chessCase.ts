import * as THREE from 'three';
export abstract class ChessCase extends THREE.Mesh
{
    public static width = 150;
    public static height = 50;
    public static depth = 150;
    constructor(material: THREE.Material){
        super(new THREE.BoxGeometry(ChessCase.width, ChessCase.height, ChessCase.depth), material);
    }
}
export class WhiteChessCase extends ChessCase {
    static porcelainTexture: THREE.Texture = new THREE.TextureLoader().load( '../../../../../../assets/chess/matcap-porcelain-white.jpg');
    constructor()
    {
        const tmpMat = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(1, 1, 1)//
            , emissive: new THREE.Color(0, 0, 0), roughness: 0.25, metalness: 0.3, flatShading: false, wireframe: false, vertexColors: false, fog: false});
        /*const material = new THREE.MeshMatcapMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true,
            alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(1, 1, 1), flatShading: false, matcap: WhiteChessCase.porcelainTexture});*/
        super(tmpMat);
    }
}
export class BlackChessCase extends ChessCase {
    constructor()
    {
        const material = new THREE.MeshStandardMaterial({transparent: false, opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, visible: true, side: THREE.FrontSide, color: new THREE.Color(0, 0, 0)//
                    , emissive: new THREE.Color(0, 0, 0), roughness: 0.25, metalness: 0.3, flatShading: false, wireframe: false, vertexColors: false, fog: false});
        super(material);
    }
}
