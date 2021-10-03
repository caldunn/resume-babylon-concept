
/*import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera, UniversalCamera } from "@babylonjs/core/Cameras/";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SphereBuilder } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { ammoModule, ammoReadyPromise } from "../externals/ammo";
import { CreateSceneClass } from "../createScene";

import  { DefaultCollisionCoordinator } from "@babylonjs/core";
DefaultCollisionCoordinator.name
*/

import * as BABYLON from "@babylonjs/core/Legacy/legacy"

import { ammoModule, ammoReadyPromise } from "../externals/ammo";
import { CreateSceneClass } from "../createScene";


import { generateGroundMaterial } from '../components/ground'

class PhysicsSceneWithAmmo implements CreateSceneClass {
    preTasks = [ammoReadyPromise];
    PLAYER_HEIGHT = 2
    MAP_SIZE = 100;
    
    createScene = async (engine: BABYLON.Engine, canvas: HTMLCanvasElement): Promise<BABYLON.Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(engine);
        
        scene.enablePhysics(null, new BABYLON.AmmoJSPlugin(true, ammoModule));
        scene.collisionsEnabled = true
        
        const camera = new BABYLON.UniversalCamera("player-cam", new BABYLON.Vector3(5,this.PLAYER_HEIGHT,5), scene)

        camera.fov = 0.8;
        camera.inertia = 0;
        // Targets the camera to a particular position. In this case the scene origin
        

        // Attach the camera to the canvas
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
        camera.checkCollisions = true;
        camera.attachControl(canvas, true);


        const player = BABYLON.Mesh.CreateBox('player', 2.0, scene, false, BABYLON.Mesh.FRONTSIDE);
        player.position.set(8, 1, 0)
        player.physicsImpostor = new BABYLON.PhysicsImpostor(
            player, 
            BABYLON.PhysicsImpostor.BoxImpostor, 
            { mass: 10, restitution: 0.0, friction: 0.1 }, 
            scene
        );
        player.physicsImpostor.physicsBody.fixedRotation = true;
        camera.setTarget(BABYLON.Vector3.Zero());
        
        // pointer
        const pointer = BABYLON.Mesh.CreateSphere(
            "Sphere", 
            16.0, 
            0.01,
            scene, 
            false, 
            BABYLON.Mesh.DOUBLESIDE
        );
        pointer.position.set(0,0,0);
        pointer.isPickable = false;

        let moveForward = false;
        let moveBackward = false;
        let moveRight = false;
        let moveLeft = false;
        let sprint = false;


        const flashLight = new BABYLON.SpotLight(
            "flashLight",
            new BABYLON.Vector3(0, 30, -10),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 10, 0.01,
            scene
        );
        flashLight.intensity = 0.3
        const flashlightSwitchSound = new BABYLON.Sound("gunshot", "sounds/sfx/flashlight_on.mp3", scene);

        const walkingSfx = new BABYLON.Sound("gunshot", "sounds/sfx/walking.mp3", scene);
        
        const onKeyPress = (event: KeyboardEvent, down: boolean): void => {

            sprint = event.shiftKey

            switch (event.key.toLowerCase()) {
                case 'arrowup': // up
                case 'w': // w
                    moveForward = down;
                    break;

                case 'arrowleft': // left
                case 'a': // a
                    moveLeft = down; break;

                case 'arrowdown': // down
                case 's': // s
                    moveBackward = down;
                    break;

                case 'arrowright': // right
                case 'd': // d
                    moveRight = down;
                    break;
                case 'f':
                    // I am sure I could combine this into a single statement e-or?
                    if (down) {
                        flashlightSwitchSound.play();
                        
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        flashLight.setEnabled(!flashLight.isEnabled())
                    }
                    
                    break;
                case 'space': // space
                    break;
            }
        };

        document.addEventListener('keydown', (e) => onKeyPress(e, true));
        document.addEventListener('keyup', (e) => onKeyPress(e, false));
        
        
        const yungLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(20, 20, 1), scene);
        yungLight.diffuse = new BABYLON.Color3(0,0,0)
        yungLight.intensity = 0.0
                
        
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        
        light.intensity = 0.0;
    
        // Our built-in 'sphere' shape.
        const sphere = BABYLON.SphereBuilder.CreateSphere(
            "sphere",
            { diameter: 2, segments: 16 },
            scene
        );
    
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
            sphere,
            BABYLON.PhysicsImpostor.SphereImpostor, 
            { mass: 2, restitution: 1}, 
            scene
        );
    
        // Move the sphere upward 1/2 its height
        sphere.position.y = 10;
        // Our built-in 'ground' shape.
        const ground = BABYLON.GroundBuilder.CreateGround(
            "ground",
            { width: this.MAP_SIZE * 1.3, height: this.MAP_SIZE * 1.3},
            scene
        );
        
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.5 }
        );
        
        
        
        const sphereStatic = BABYLON.SphereBuilder.CreateSphere(
            "sphere",
            { diameter: 2, segments: 16 },
            scene
        );
        sphereStatic.position.y = 2
        sphereStatic.position.z = -6
        sphereStatic.position.x = 4;

        const groundMaterial = generateGroundMaterial(scene);
        
        sphereStatic.material = groundMaterial;
        ground.material = groundMaterial;
        // Create a centre pillar 
        const pillar = BABYLON.MeshBuilder.CreateBox("centre-pillar", {
            size: 1,
            height: 100,
        })
        
        const pillarMat = new BABYLON.StandardMaterial("myMaterial", scene);
        pillarMat.wireframe = true;
        pillar.material = pillarMat;
        sphere.material = pillarMat;

        // Build the surrounding walls
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const walls = generateWalls(this.MAP_SIZE, this.MAP_SIZE);
        walls.forEach((wall, index) => {
            const tempWall = BABYLON.MeshBuilder.CreateBox( `wall-${index}`, {
                size: wall.length,
                width: wall.width,
                height: wall.height,
                })
            tempWall.position = wall.position
            // tempWall.
            tempWall.physicsImpostor = new BABYLON.PhysicsImpostor(
                tempWall,
                BABYLON.PhysicsImpostor.BoxImpostor,
                {mass: 0, restitution: 0.8}
            )
        });
        

        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: this.MAP_SIZE * 1.3}, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        
        skyboxMaterial.backFaceCulling = false;
        // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/space/skybox2", scene);
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/forest/forest", scene, 
            ["_px.png", "_py.png", "_pz.png", "_nx.png", "_ny.png", "_nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        

        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        //BABYLON.Scene.FOGMODE_NONE;
        //BABYLON.Scene.FOGMODE_EXP;
        //BABYLON.Scene.FOGMODE_EXP2;
        //BABYLON.Scene.FOGMODE_LINEAR;

        scene.fogStart = 10;
        scene.fogEnd = 300;
        scene.fogDensity = 0.02;


        scene.registerBeforeRender(() => {

            camera.position = player.position.clone()
            camera.position.y = player.position.y + 1;
            flashLight.position = camera.position.clone();

            // flashLight.parent = camera;
            pointer.position = camera.getTarget();

            const forward = camera.getTarget().subtract(camera.position).normalize();
            const right = BABYLON.Vector3.Cross(forward, camera.upVector).normalize();

            flashLight.direction = forward.clone()

            // Jumping is not supported due to this limitation. 
            forward.y = 0;
            right.y = 0;

            const BASE_SPEED = 15;
            let playBackSpeed = sprint ? 1.5 : 1;
            const speed = sprint ? BASE_SPEED * 1.5 : BASE_SPEED
            const movementVector = { x: 0, y: 0, z: 0 }
            
            if (moveForward) { movementVector.z = speed;}
            if (moveBackward) { movementVector.z = -speed * 0.2; playBackSpeed *= 0.5}

            if (moveRight) { movementVector.x = speed * 0.5;}
            if (moveLeft) { movementVector.x = -speed * 0.5;}

            if (moveForward || moveLeft || moveRight || moveBackward) {
                if (!walkingSfx.isPlaying) walkingSfx.play(); 
                // Check for sprint condition
                walkingSfx.setPlaybackRate(playBackSpeed)
            } else {
                walkingSfx.pause();
            }
            const move = (
                forward.scale(movementVector.z))
                .subtract((right.scale(movementVector.x)))
                .subtract(camera.upVector.scale(movementVector.y)
                );

            if (player.physicsImpostor?.physicsBody != undefined) {
                player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(move.x, move.y, move.z));
            }
            
            sphereStatic.addRotation(0, 0.01, 0)
        });


        const music = new BABYLON.Sound(
            "Music",
            "sounds/ambience/MusicEerieHorrorT TEE037701_preview.mp3", 
            scene, 
            () => {
                music.setVolume(0.4)
                music.play();
            },
            {
            loop: true,
    
        });
        
        
        return scene;
    };
    
    
}

interface BoundaryWall {
    length: number;
    width: number;
    height: number;
    position: BABYLON.Vector3;
}

function generateWalls(x: number, z: number): Array<BoundaryWall> {
    const walls: Array<BoundaryWall> = []
    const height = 1.5;
    walls.push({
        length: x,
        width: 1,
        height: height,
        position: new BABYLON.Vector3(x/2, 1, 0)
    });

    walls.push({
        length: x,
        width: 1,
        height: height,
        position: new BABYLON.Vector3(-x/2, 1, 0)
    });

    walls.push({
        length: 1,
        width: z,
        height: height,
        position: new BABYLON.Vector3(0, 1, z/2)
    });

    walls.push({
        length: 1,
        width: z,
        height: height,
        position: new BABYLON.Vector3(0, 1, -z/2),
    });
    
    return walls;
}
export default new PhysicsSceneWithAmmo();
