import * as THREE from 'three';

export function addLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 50, 50).normalize();
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-400, -100, 80);
    scene.add(directionalLight2);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.8);
    scene.add(hemisphereLight);
}