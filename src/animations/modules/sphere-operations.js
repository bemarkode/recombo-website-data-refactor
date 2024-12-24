import * as THREE from 'three';
import { surface } from '../modules/surface.js';
import { ColorGradient } from './color-gradient.js';

// Core sphere state management
export function resetSphere(sphere, index, spheresData) {
    sphere.status = Math.random() < 0.75 ? 'good' : 'bad';
    sphere.scanned = false;
    sphere.highlightedIssue = false;
    sphere.row = Math.floor(index / spheresData.width);
    sphere.col = index % spheresData.width;
    if (sphere.row !== 70) {
        sphere.scale.set(1, 1, 1);
    } else {
        sphere.scale.set(0, 0, 0)
    }

    return sphere;
}

export function updateSpherePositionRisk(sphere, flowSpeed) {
    // Reset values when re-entering surface
    if (sphere.v >= 0.97) {
        sphere.position.z = 0;
        sphere.scale.x = sphere.scale.y = sphere.scale.z = 1;
        sphere.u = sphere.col / 70; // Reset to original column position
    }
    
    // Update v position
    sphere.v = (sphere.v - flowSpeed + 1) % 1;
    const newPosition = new THREE.Vector3();
    
    // First transition (v: 0.2-0.4)
    if (sphere.v >= 0.5 && sphere.v <= 0.9) {
        const transitionProgress = 1 - (sphere.v - 0.4) / 0.5;
        
        const targetScale = sphere.risk === 'none' ? 1 :
                          sphere.risk === 'low' ? 1.25 :
                          sphere.risk === 'mid' ? 1.5 : 1.75;
        
        const targetZ = sphere.risk === 'none' ? 0 :
                       sphere.risk === 'low' ? 200 :
                       sphere.risk === 'mid' ? 400 : 600;
        
        sphere.scale.x = sphere.scale.y = sphere.scale.z = 
            1 + (targetScale - 1) * transitionProgress;
        sphere.position.z = targetZ * transitionProgress;
    }

    // Second transition (v: 0.6-0.8)
    if (sphere.v >= 0.4 && sphere.v <= 0.8) {
        const transitionProgress = 1 - (sphere.v - 0.4) / 0.4;
        
        // Use column number for consistent spacing
        const columnsInRow = 70;
        const colPosition = sphere.col / columnsInRow;
        
        let targetU;
        if (sphere.risk === 'none') {
            targetU = colPosition * 0.3 + 0.1;
        } else if (sphere.risk === 'low') {
            targetU = 0.38 + (colPosition * 0.2);
        } else if (sphere.risk === 'mid') {
            targetU = 0.6 + (colPosition * 0.15);
        } else {
            targetU = 0.74 + (colPosition * 0.1);
        }
        
        sphere.u = sphere.col / columnsInRow + (targetU - colPosition) * transitionProgress;
    }

    surface.getPoint(sphere.u, sphere.v, newPosition);
    sphere.position.x = newPosition.x;
    sphere.position.y = newPosition.y;
    
    sphere.realRow = Math.floor(sphere.v * 70);
    sphere.realIndex = getIndexFromCoordinates(sphere.realRow, sphere.col, 70);
    
    return sphere;
}

export function updateSpherePosition(sphere, flowSpeed) {
    sphere.v = (sphere.v - flowSpeed + 1) % 1;

    // Get the new x and y positions from the surface
    const newPosition = new THREE.Vector3();
    surface.getPoint(sphere.u, sphere.v, newPosition);

    // Update only x and y coordinates
    sphere.position.x = newPosition.x;
    sphere.position.y = newPosition.y;

    // Keep the z-coordinate unchanged
    // sphere.position.z remains managed by other logic

    sphere.realRow = Math.floor(sphere.v * 70);
    sphere.realIndex = getIndexFromCoordinates(sphere.realRow, sphere.col, 70)

    return sphere;
}

export function isSphereAtReset(sphere) {
    return sphere.v > 0.99;
}

export function shouldSphereBeScanned(sphere, flowSpeed, sphereCounter) {
    const isVisible = sphere.visible;
    const inScanRange = sphere.v >= 0.5 && sphere.v < 0.5 + flowSpeed;
    const isScanInterval = sphereCounter % 10 === 0;
    const isNotScanned = !sphere.scanned;
  
    return isVisible && inScanRange && isScanInterval && isNotScanned;
}

// Sphere visualization
export function getSphereColor(sphere) {
    const color = new THREE.Color();
    if (sphere.highlightedIssue) {
        color.setHex(0xff0000); // Red for highlighted issues
    } else if (sphere.status === 'good' && !sphere.scanned) {
        color.setHex(0xffffff);
    } else if (sphere.status === 'bad' && !sphere.scanned) {
        color.setHex(0xffbbbb);
    } else if (sphere.status === 'good' && sphere.scanned) {
        color.setHex(0x00ff00);
    } else {
        color.setHex(0xff0000);
    }
    
    return color;
}

export function updateSphereColor(sphere, instancedMesh, index) {
    const color = getSphereColor(sphere);
    instancedMesh.setColorAt(index, color);
    instancedMesh.instanceColor.needsUpdate = true;
}

// Helper function to get grid coordinates from index
export function getGridCoordinates(index, width) {
    return {
        row: Math.floor(index / width),
        col: index % width
    };
}

// Helper function to get index from grid coordinates
export function getIndexFromCoordinates(row, col, width) {
    return row * width + col;
}

export function getVisibleSpheresArray(spheresData) {

    // Filter visible spheres and calculate normalized positions
    const visibleSpheres = spheresData.filter(sphere => sphere.visible)
        .map(sphere => {

            return {
                ...sphere,

            };
        });

    // Sort spheres by row and column for consistent processing
    visibleSpheres.sort((a, b) => {
        if (a.row === b.row) {
            return a.col - b.col;
        }
        return a.row - b.row;
    });

    return { spheres: visibleSpheres };
}

export function updateSphereColorByHeight(sphere, spheres, index) {
    const colorGradient = new ColorGradient();
    const height = sphere.height || 0;
    const minHeight = 0;
    const maxHeight = 400;
    const color = colorGradient.mapHeightToColor(height, minHeight, maxHeight);
    spheres.setColorAt(index, color);
}