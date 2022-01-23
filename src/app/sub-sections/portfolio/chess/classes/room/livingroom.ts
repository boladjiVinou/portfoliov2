import * as THREE from 'three';
import { PointLight } from 'three';
export class LivingRoom {
    public static LampBulbColor = new THREE.Color(0Xeeee00);
    private children: THREE.Object3D[] = [];
    init(): void
    {
        const floorTexture: THREE.Texture = new THREE.TextureLoader().load( '../../../../../../assets/chess/wood-texture/floor-texture.jpg');
        floorTexture.repeat.set( 4, 4);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        const floor = new THREE.Mesh(new THREE.BoxGeometry(10000, 300, 10000), new THREE.MeshLambertMaterial({map: floorTexture}));
        floor.receiveShadow = true;
        floor.position.set(0, -1000, 0);
        this.children.push(floor);

        const frontWall = new THREE.Mesh(new THREE.BoxGeometry(10000, 300, 9700), new THREE.MeshLambertMaterial({color: 0x8D2828, emissive: new THREE.Color(0, 0, 0), //
                                        opacity: 1, depthTest: true, depthWrite: true, alphaTest: 0, reflectivity: 1, refractionRatio: 0.98, transparent: false})); //  0x93C572
        frontWall.translateX(-4840);
        frontWall.translateY(4180);
        frontWall.translateZ(150);
        frontWall.rotateZ(Math.PI / 2);
        frontWall.castShadow = true;
        this.children.push(frontWall);

        const sideWallBase = new THREE.Mesh(new THREE.BoxGeometry(10000, 300, 10000), frontWall.material.clone());
        sideWallBase.translateY(4180);
        sideWallBase.translateZ(-4850);
        sideWallBase.rotateX(Math.PI / 2);
        this.children.push(sideWallBase);

        const jocondeImg =  new THREE.TextureLoader().load( '../../../../../../assets/chess/joconde3.png' );
        const jocondeContainer = new THREE.Mesh(new THREE.PlaneGeometry(2000, 3000), new THREE.MeshBasicMaterial({map: jocondeImg, transparent: true}));
        jocondeContainer.translateY(5000);
        jocondeContainer.translateZ(-4650);
        this.children.push(jocondeContainer);

        const tableTexture: THREE.Texture = new THREE.TextureLoader().load( '../../../../../../assets/chess/wood-texture/table-texture.jpg');
        const table = new THREE.Mesh(new THREE.CylinderGeometry(1600, 1600, 100, 30), new THREE.MeshLambertMaterial({map: tableTexture}));
        table.translateY(1500);
        const tablePiliar = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 2600, 30), new THREE.MeshLambertMaterial({map: tableTexture}));
        tablePiliar.translateY(-1300);
        table.add(tablePiliar);
        this.children.push(table);

        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(200, 500, 700, 23, 1, true), new THREE.MeshLambertMaterial({color: 0xF3C892, transparent: true}));
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(150), new THREE.MeshBasicMaterial({color: LivingRoom.LampBulbColor}));
        const lampSupport = new THREE.Mesh(new THREE.CylinderGeometry(35, 35, 5200, 23, 1), new THREE.MeshLambertMaterial({color: 0x000000}));
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(200, 200, 35), lampSupport.material.clone());
        lampSupport.translateY(-2800);
        lampBase.translateY(-5300);
        lamp.add(lampBase);
        lamp.add(lampSupport);
        lamp.add(bulb);
        lamp.translateY(4500);
        lamp.translateX(-4000);
        lamp.translateZ(-4000);

        const bookSupport = new THREE.Mesh(new THREE.BoxGeometry(800, 200, 2500), new THREE.MeshLambertMaterial({color: 0xF14A16}));
        bookSupport.translateY(6000);
        bookSupport.translateZ(3600);
        bookSupport.translateX(-4280);

        this.children.push(lamp);
        this.children.push(bookSupport);
    }
    getChildren(): ReadonlyArray<THREE.Object3D>
    {
        return this.children as ReadonlyArray<THREE.Object3D>;
    }
}
