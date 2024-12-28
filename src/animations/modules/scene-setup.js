import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const createScene = () => {
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);  // White background

  let my_model;
  let gltfLoader = new GLTFLoader()

  
  gltfLoader.load(
      '3d/360.glb',
      (gltf) =>
      {
          my_model = gltf.scene;

          my_model.rotation.set(Math.PI, 0, 0);
          my_model.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0
          })
          my_model.name = '360 Model';
          my_model.visible = false
          scene.add(my_model)
      }
  )
  return { scene };
};

export const createCamera = () => {
  const camera = new THREE.OrthographicCamera(-800, 800, 600, -600, 0.1, 20000);
  camera.up.set(0, 0, 1);
  // const camera = new THREE.PerspectiveCamera( 30, 800 / 600, 0.1, 20000 );
  camera.updateProjectionMatrix();
  const center = new THREE.Vector3(0, 0, 0);
  camera.position.set(center.x, center.y - 4000, center.z + 750);
  camera.lookAt(center);
  return camera;
};

export const createRenderer = () => {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
    outputColorSpace: "srgb-linear",
  });
  renderer.setSize(800, 600);
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
  return renderer;
};

