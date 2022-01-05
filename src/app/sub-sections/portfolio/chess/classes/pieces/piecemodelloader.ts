import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export class PieceModelLoader
{
    private static instance: PieceModelLoader;
    private modelsMap: Map<string, THREE.Object3D> = new Map<string, THREE.Object3D>();

    private constructor() { }

    public static getInstance(): PieceModelLoader {
        if (!PieceModelLoader.instance) {
            PieceModelLoader.instance = new PieceModelLoader();
        }

        return PieceModelLoader.instance;
    }

    public getModel(modelPath: string): Promise<THREE.Object3D>
    {
        const key = modelPath.toLowerCase();
        return new Promise<THREE.Object3D>((resolve) =>
        {
            if (this.modelsMap.has(key))
            {
                resolve(this.modelsMap.get(key).clone());
                return;
            }
            else
            {
                const loader = new GLTFLoader();
                loader.load(modelPath, (model: GLTF) =>
                {
                    this.modelsMap.set(key, model.scene);
                    resolve(model.scene);
                    return;
                },
                null,
                ( error ) =>
                {
                    console.log( 'An error happened while loading chesspiece model', error );
                });
            }
        });
    }
    public clear(): void
    {
        this.modelsMap.clear();
    }
}
