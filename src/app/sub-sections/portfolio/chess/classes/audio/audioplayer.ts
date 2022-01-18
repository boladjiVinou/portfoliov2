import * as THREE from 'three';
export class AudioPlayer
{
    private sound: THREE.Audio;
    private isEnabled: boolean;
    public initSound(camera: THREE.Camera, scene: THREE.Scene, soundPath: string): Promise<void>
    {
        return new Promise<void>((resolve) => {
            // instantiate a listener
            const audioListener = new THREE.AudioListener();
            // add the listener to the camera
            camera.add( audioListener );
            // instantiate audio object
            this.sound = new THREE.Audio( audioListener );
            // add the audio object to the scene
            scene.add( this.sound  );
            // instantiate a loader
            const loader = new THREE.AudioLoader();
            // load a resource
            loader.load(
                // resource URL
                soundPath,
                // onLoad callback
                ( audioBuffer ) => {
                    this.sound.setBuffer(audioBuffer);
                    this.sound.setLoop(true);
                    resolve();
                    return;
                },
                // onProgress callback
                ( xhr ) => {
                    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },
                // onError callback
                ( err: any )  => {
                    console.log( err);
                }
            );
        });
    }
    public setEnable(isEnabled: boolean)
    {
        this.isEnabled = isEnabled;
    }
    public stopSound() {
        if (this.sound !== undefined && this.sound.isPlaying) {
            this.sound.stop();
        }
    }
    public playSound(playWithLoop: boolean) {
        if (this.sound !== undefined && this.isEnabled) {
            this.sound.play();
            this.sound.setLoop(playWithLoop);
        }
    }
}
