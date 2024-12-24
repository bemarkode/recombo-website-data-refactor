import * as THREE from 'three';
import * as SphereOps from '../../modules/sphere-operations.js';
import { store } from '../../modules/store.js';
import { gsap } from 'gsap';

export class Stage1Visualization {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData;
        this.spheres = spheres;
        this.scene = store.getScene(); // Assuming you've added the scene to the store
        this.scanningSpheres = [];
    }

    clearAnimations() {
        // Kill any ongoing GSAP animations
        gsap.killTweensOf(this.spheresData);
        
        // Remove any temporary objects from the scene
        this.scanningSpheres.forEach(sphere => this.scene.remove(sphere));
        this.scanningSpheres = [];

        // Reset any other animation-related properties
        this.spheresData.forEach(sphere => {
            sphere.isAnimating = false;
        });
    }

    async animateSphereUp(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        return new Promise((resolve) => {
            sphere.isAnimating = true;
            const startScale = sphere.scale.z
            gsap.to(sphere.scale, {
                x: startScale * 1.5,
                y: startScale * 1.5,
                z: startScale * 1.5,
                duration: 0.25,
                ease: "power4.inOut",
                onUpdate: () => {
                    // this.updateSphereMatrix(sphere, sphereIndex);
                },
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    async animateSphereDown(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        return new Promise((resolve) => {
            sphere.isAnimating = true;
            // const startScale = sphere.scale.x;
            gsap.to(sphere.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.25,
                ease: "power4.inOut",
                onUpdate: () => {
                    // this.updateSphereMatrix(sphere, sphereIndex);
                },
                onComplete: () => {
                    sphere.isAnimating = false;
                    resolve();
                }
            });
        });
    }

    async animateAllSpheresDown(sphereIndices) {
        const animations = sphereIndices.map(index => this.animateSphereDown(index));
        await Promise.all(animations);
    }

    async createScanningSphere(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        return new Promise((resolve) => {
            const zPos = sphere.position.z;
            const clipPlane = new THREE.Plane(new THREE.Vector3(0, -0.20, -1), zPos - 28);

            const scanSphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x119988,
                opacity: 1,
                clippingPlanes: [clipPlane],
                side: THREE.BackSide,
                clipShadows: true,
            });
           
            const scanSphereGeometry = new THREE.SphereGeometry(28, 32, 32);
            const scanSphere = new THREE.Mesh(scanSphereGeometry, scanSphereMaterial);
            scanSphere.position.copy(sphere.position);
            this.scene.add(scanSphere);
    
            gsap.to(clipPlane, {
                constant: zPos + 28,
                duration: 0.5,
                onUpdate: () => {
                    scanSphereMaterial.needsUpdate = true; 
                },
                onComplete: () => {
                    this.scene.remove(scanSphere);
                    resolve();
                }
            });
        });
    }


    // updateAllSphereColors() {
    //     this.spheresData.forEach((sphere, i) => this.updateSphereColor(sphere, i));
    // }



    // updateSphereMatrix(sphere, index) {
    //     SphereOps.updateSphereMatrix(sphere, this.spheres, index);
    // }

    // async animateSpheresUp(sphereIndices) {
    //     const animations = sphereIndices.map(index => this.animateSphereUp(index));
    //     await Promise.all(animations);
    // }

    // // updateSphereAfterReset(sphere, index) {
    // //     this.updateSphereColor(sphere, index);
    // //     this.updateSphereMatrix(sphere, index);
    // // }
    
    
    // updateAllSphereColors() {
    //     this.spheresData.forEach((sphere, i) => this.updateSphereColor(sphere, i));
    // }



    // updateSphereMatrix(sphere, index) {
    //     SphereOps.updateSphereMatrix(sphere, this.spheres, index);
    // }

    // async animateSpheresUp(sphereIndices) {
    //     const animations = sphereIndices.map(index => this.animateSphereUp(index));
    //     await Promise.all(animations);
    // }

    // // updateSphereAfterReset(sphere, index) {
    // //     this.updateSphereColor(sphere, index);
    // //     this.updateSphereMatrix(sphere, index);
    // // }
    
    updateVisuals() {
        this.spheresData.forEach((sphere, index) => {
            SphereOps.updateSphereColor(sphere, this.spheres, index);
        });
    }
}