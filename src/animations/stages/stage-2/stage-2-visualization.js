import * as THREE from 'three';
import * as SphereOps from '../../modules/sphere-operations.js';
import { store } from '../../modules/store.js';
import { gsap } from 'gsap';

export class Stage2Visualization {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData
        this.spheres = spheres
        this.scene = store.getScene(); // Assuming you've added the scene to the store
        this.scanningSpheres = [];
    }

    async animateSphereUp(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        return new Promise((resolve) => {
            sphere.isAnimating = true;
            const startScale = sphere.scale.x;
            gsap.to(sphere.scale, {
                x: startScale * 1.5, // Increase scale by 50%
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

    async highlightUndetectedSphere(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        return new Promise((resolve) => {
            sphere.isAnimating = true;
            sphere.highlightedIssue = true;
            const startScale = sphere.scale.x;
            gsap.to(sphere.scale, {
                x: startScale * 1.5,
                y: startScale * 1.5,
                z: startScale * 1.5,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
                onUpdate: () => {
                    this.updateSphereColor(sphere, sphereIndex);
                },
                onComplete: () => {
                    sphere.isAnimating = false;
                    resolve();
                }
            });
        });
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

            this.scanningSpheres.push(scanSphere);
    
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

    updateAllSphereColors() {
        this.spheresData.forEach((sphere, i) => this.updateSphereColor(sphere, i));
    }

    updateSphereColor(sphere, index) {
        SphereOps.updateSphereColor(sphere, this.spheres, index);
    }

    async animateSpheresUp(sphereIndices) {
        const animations = sphereIndices.map(index => this.animateSphereUp(index));
        await Promise.all(animations);
    }

    updateVisuals() {
        this.spheresData.forEach((sphere, index) => {
            this.updateSphereColor(sphere, index);
        });
    }
}