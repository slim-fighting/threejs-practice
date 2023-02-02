import { TextureLoader } from "three";

const textureLoader = new TextureLoader()
export const picture = textureLoader.load('/1.png'); 
export const frameColor = textureLoader.load('frame_Color.jpg');
export const frameDisplacement = textureLoader.load('frame_Displacement.jpg');
export const frameRoughness = textureLoader.load('frame_Roughness.jpg')