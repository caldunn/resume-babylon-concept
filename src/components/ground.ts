import * as BABYLON from "@babylonjs/core/Legacy/legacy"

export function generateGroundMaterial(scene: BABYLON.Scene): BABYLON.StandardMaterial {
    const scale = 20;
    // I would like to index the variables in a dictionary but then I lose the elegant array prototype methods.
    // const textures: { [key: string]: BABYLON.Texture } = {};

    const rMat = new BABYLON.StandardMaterial("rMat", scene);
    const textures: Array<BABYLON.Texture> = [];
    // const basePath = "textures/vines/Jungle_Floor_001_";
    const basePath = "textures/rockmoss/Rock_Moss_001_";
    textures.push(new BABYLON.Texture(`${basePath}height.png`, scene))


    textures.push(new BABYLON.Texture(`${basePath}ambientOcclusion.jpg`, scene))

    // Base texture 
    textures.push(new BABYLON.Texture(`${basePath}basecolor.jpg`, scene));

    textures.push(new BABYLON.Texture(`${basePath}height.png`, scene));
    textures.map(texture => texture.uScale = texture.vScale = scale / 2);

    rMat.bumpTexture = textures[0];
    rMat.ambientTexture = textures[1];

    rMat.diffuseTexture = textures[2];
    rMat.specularTexture = textures[2];
    rMat.emissiveTexture = textures[2];

    rMat.detailMap.texture = textures[3];
    
    return rMat;
}