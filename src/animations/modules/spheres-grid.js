import * as THREE from 'three';
import { surface } from './surface.js';
import { gsap } from 'gsap';

export function createSpheresOnSurface(gridHeight, gridWidth) {

    const sphereGeometry = new THREE.SphereGeometry(10, 8, 8);
    const errorGeometry = new THREE.SphereGeometry(25, 8, 8);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        vertexColors: false,
        metalness: 0.1,
        roughness: 0.1,
        emissive: 0x020202,
    });
    const errorMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide
    });
    
    const totalSpheres = gridWidth * gridHeight;
    const spheres = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, totalSpheres);
    const errorSpheres = new THREE.InstancedMesh(errorGeometry, errorMaterial, totalSpheres);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    let scale = new THREE.Vector3(1, 1, 1);

    const spheresData = [];
    const errorData = [];

    spheresData.width = gridWidth
    spheresData.height = gridHeight
    
    // Correct grid initialization
    for (let i = 0; i < totalSpheres; i++) {
        const row = Math.floor(i / gridWidth);
        const col = i % gridWidth;
        
        // Calculate UV coordinates
        const u = col / (gridWidth - 1);
        const v = row / (gridHeight - 1);

        const realIndex =  i
        const realRow = Math.floor(realIndex / gridWidth)
        
        surface.getPoint(u, v, position);

        // if (row === 70) { scale = new THREE.Vector3(0, 0, 0) }
        matrix.compose(position, new THREE.Quaternion(), scale);
        spheres.setMatrixAt(i, matrix);
        errorSpheres.setMatrixAt(i, matrix);
        const status = Math.random() < 0.75 ? 'good' : 'bad';
        
        // Store grid coordinates with sphere data
        if (row !== 70) {
            spheresData.push({
                index: i,
                row: row,
                col: col,
                u: u,
                v: v,
                status: status,
                visible: true,
                position: position.clone(),
                color: new THREE.Color(0xffffff),
                isAnimating: false,
                scale: new THREE.Vector3(1, 1, 1),
                rotation: new THREE.Quaternion(),
                scanned: false,
                realIndex: realIndex,
                realRow: realRow


            });

            errorData.push({
                index: i,
                row: row,
                col: col,
                u: u,
                v: v,
                status: status,
                visible: false,
                position: position.clone(),
                color: new THREE.Color(0xffffff),
                isAnimating: false,
                scale: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Quaternion(),
                scanned: false
            });
        }
    }

    function updateInstancedMesh() {
        spheresData.forEach((sphere, i) => {
            if (sphere.visible) {
                // if (sphere.row === sphere.totalRows - 1) { // Check if the sphere is on the last row
                //     sphere.scale.set(0, 0, 0);
                // }
                matrix.compose(sphere.position, sphere.rotation, sphere.scale);
                spheres.setMatrixAt(i, matrix);
            } else {
                matrix.compose(sphere.position, sphere.rotation, new THREE.Vector3(0, 0, 0));
                spheres.setMatrixAt(i, matrix);
            }
        });
        
        errorData.forEach((sphere, i) => {
            matrix.compose(sphere.position, sphere.rotation, sphere.scale);
            errorSpheres.setMatrixAt(i, matrix);
        });
        
        spheres.instanceMatrix.needsUpdate = true;
        errorSpheres.instanceMatrix.needsUpdate = true;
    }

    gsap.ticker.add(updateInstancedMesh);

    return { spheres, spheresData, updateInstancedMesh, errorSpheres, errorData };
}