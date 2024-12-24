// stage-4-control.js
import { store } from '../../modules/store.js';
// import * as SphereOps from '../../modules/sphere-operations.js';
import { gsap } from 'gsap';
import * as THREE from 'three';


export class Stage4Control {
    constructor(spheres, spheresData, logic, visualization) {
        this.logic = logic;
        this.visualization = visualization;
        this.spheresData = spheresData;
        this.spheres = spheres;
        this.lastActionTime = 0; // Tracks the last time an action occurred
        this.state = 0; // Tracks the current state in the sequence
        this.rootCauseX = 0;
        this.rootCauseY = 0;
        this.scene = store.getScene();
    }

    update() {
        const now = performance.now(); // High-resolution timestamp

        this.visualization.updateVisuals();
        // Check the state and time since the last action
        if (this.state === 0 && now - this.lastActionTime > 500) {
            // First action: Generate random height
            // this.visualization.updateVisuals();
            this.generateRandomHeight();
            this.lastActionTime = now;
            this.state = 1; // Move to the next state
        } else if (this.state === 1 && now - this.lastActionTime > 400) {
            // Second action: Scale up based on distance
            this.scaleUpBasedOnDistance( this.rootCauseX, this.rootCauseY );
            this.lastActionTime = now;
            this.state = 2; // Move to the next state
        } else if (this.state === 2 && now - this.lastActionTime > 500) {
            // Third action: find root cause
            this.findRootCause();
            this.lastActionTime = now;
            this.state = 3; // Move to the next state
        } else if (this.state === 3 && now - this.lastActionTime > 500) {
            // Fourth action: Scale Up root cause 
            this.scaleUpRootCause();
            this.lastActionTime = now;
            this.state = 4; // Move to the next state
        } else if (this.state === 4 && now - this.lastActionTime > 500) {
            // Fifth action: Recolor the root cause
            this.createScanningSphere(this.rootCauseX, this.rootCauseY)
            this.lastActionTime = now;
            this.state = 5; // Move to the next state
        } else if (this.state === 5 && now - this.lastActionTime > 500) {
            this.moveSphereDown(this.rootCauseX, this.rootCauseY)
            this.lastActionTime = now;
            this.state = 6; // Move to the next state
        } else if (this.state === 6 && now - this.lastActionTime > 750){
            // Sixth action: Move rootcause down
            // CENTRALIZE THE HEIGHT DOWN
            this.logic.resetHeights(); 
            // this.spheresData.forEach(element => {
            //     gsap.to(element.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.inOut" });
            // });
            this.lastActionTime = now;
            this.state = 0; // Reset to the first state
        }
    }

    moveSphereDown(rootCauseX, rootCauseY) {
        const sphere = this.spheresData.find(element => element.realRow === rootCauseX && element.col === rootCauseY);
        gsap.to(sphere.position, { z: 0, duration: 0.5, ease: "power2.inOut" });
        this.spheresData.forEach(element => {
            const distance = Math.sqrt(Math.pow(element.realRow - rootCauseX, 2) + Math.pow(element.col - rootCauseY, 2));
            const delay = .007 * distance + 0.15;
            gsap.to(element.position, { z: 0, duration: 0.5, delay: delay, ease: "power2.inOut" });
            gsap.to(element.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: delay, ease: "power2.inOut" });
        });

    }

    createScanningSphere(rootCauseX, rootCauseY) {
        const sphere = this.spheresData.find(element => element.realRow === rootCauseX && element.col === rootCauseY);
        return new Promise((resolve) => {
            const zPos = sphere.position.z;
            const clipPlane = new THREE.Plane(new THREE.Vector3(0, -0.20, zPos-75), zPos);

            const scanSphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x119988,
                opacity: 1,
                clippingPlanes: [clipPlane],
                side: THREE.BackSide,
                clipShadows: true,
            });
            
            const scanSphereGeometry = new THREE.SphereGeometry(105, 32, 32);
            const scanSphere = new THREE.Mesh(scanSphereGeometry, scanSphereMaterial);
            scanSphere.position.copy(sphere.position);
            this.scene.add(scanSphere);
    
            gsap.to(clipPlane, {
                constant: zPos + 75,
                duration: .5,
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

    recolorRootCause() {
        this.spheresData.filter(element => element.realRow === this.rootCauseX && element.col === this.rootCauseY).forEach(element => {
            element.color = new THREE.Color(0xff00ff);
            console.log("hello");
        });
    }

    scaleUpRootCause() {
        this.spheresData.filter(element => element.realRow === this.rootCauseX && element.col === this.rootCauseY).forEach(element => {
            gsap.to(element.scale, { x: 8, y: 8, z: 8, duration: 0.5, ease: "power2.inOut" });
            gsap.to(element.position, {  z: element.position.z + 200, duration: 0.5, ease: "power2.inOut" });
        });
    }

    generateRandomHeight() {
        this.rootCauseX = Math.floor(Math.random() * 40) + 15;
        this.rootCauseY = Math.floor(Math.random() * 40) + 15;
        // this.rootCauseX = 45;
        // this.rootCauseY = 15;
        this.logic.generateHeightAt(this.rootCauseX, this.rootCauseY);
    }

    findRootCause() {

        // Filter and animate the row
        const rowElements = this.spheresData.filter(element => element.realRow === this.rootCauseX);
        this.animateRow(rowElements, this.rootCauseY);
    
        // Filter and animate the column
        const colElements = this.spheresData.filter(element => element.col === this.rootCauseY);
        this.animateCol(colElements, this.rootCauseX);
    }

    scaleUpBasedOnDistance(rootCauseX, rootCauseY) {

        // Calculate distances from the root cause for each element
        const distances = this.spheresData.map(element => ({
            element,
            distance: Math.abs(element.realRow - rootCauseX) + Math.abs(element.col - rootCauseY),
        }));

        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);

        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;

        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;
            const scaleFactor = 1.5 * (0.5 + 3*delay);

            gsap.to(element.scale, {
                x: scaleFactor,
                y: 1.5 * (0.5 + 3*delay),
                z: 1.5 * (0.5 + 3*delay),
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });

        });
    }
    
    animateRow(rowElements, rootCauseY) {

        // Calculate distances from the root cause for each element
        const distances = rowElements.map(element => ({
            element,
            distance: Math.abs(element.col - rootCauseY),
        }));
    
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);

        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;
    
        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 4,
                y: 4,
                z: 4,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    }
    
    animateCol(colElements, rootCauseX) {

        // Calculate distances from the root cause for each element
        const distances = colElements.map(element => {
            const distance = Math.abs(element.realRow - rootCauseX);
            return {
                element,
                distance,
            };
        });
   
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);
    
        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;

        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 4,
                y: 4,
                z: 4,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    }
}

