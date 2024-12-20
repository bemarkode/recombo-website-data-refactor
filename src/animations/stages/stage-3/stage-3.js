import * as THREE from 'three';

import { Stage3Logic } from './stage-3-logic.js';
import { Stage3Visualization } from './stage-3-visualization.js';
import { Stage3Control } from './stage-3-control.js';
import { store } from '../../modules/store.js';
import { visibilityManager } from '../../modules/visibility-manager.js';
import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
import { gsap } from 'gsap';
import { HeightController } from '../../modules/height-operations.js';

export class Stage3 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.config = stageConfigs.stage3;
        this.logic = new Stage3Logic(spheres, spheresData);
        this.visualization = new Stage3Visualization(spheres, spheresData);
        this.control = new Stage3Control(spheres, spheresData, this.logic, this.visualization);
        this.camera = store.getCamera();
        this.scene = store.getScene();
        this.renderer = store.getRenderer();

        // Highlighting
        this.highlightedSpheres = new Set();
        this.HeightController = new HeightController(spheresData);


    }
    
    async transitionToNext() {
        console.log('Stage3: Preparing transition to Stage 4');
        this.isTransitioning = true;

        // Reset sphere states
        this.spheresData.forEach(sphere => {

                gsap.to(sphere.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
        });

        console.log('Stage3: Ready for Stage 4');
    }

    async transitionToPrevious() {
        this.isTransitioning = true;
        console.log('Stage3: Preparing to transition to previous stage');
        // Reset all spheres to normal state
        this.spheresData.forEach(sphere => {
            // sphere.isPartOfLine = false;
            sphere.scale.set(1, 1, 1);
        });
        // this.resetCameraPosition();
        console.log('Stage3: Ready for previous stage');
    }
    
    async transitionFromNext() {
        console.log('Stage3: Transitioning from Stage 4');
        
        this.spheresData.forEach(sphere => {
            sphere.position.z = 0;
        })
        this.spheresData.forEach(sphere => {
            sphere.scale.set(1, 1, 1);
        });
        // Reset transition state
        this.isTransitioning = false;
        
        
        
        await this.highlightBadLines();
    
        console.log('Stage3: Transition from Stage 4 complete');
    }
    
    async transitionFromPrevious() {
        this.isTransitioning = false;
        console.log('Stage 3: Starting transitionFromPrevious');
      
        // Reset all sphere properties
        this.spheresData.forEach(sphere => {
            sphere.scanned = false;
            sphere.scale.set(1, 1, 1);
        });
        
        this.scene.add(this.scanLine);
     
        console.log('About to perform line detection');
        await this.highlightBadLines();
        console.log('Line detection complete');
        
        this.update(0);
        console.log('Stage 3 transition complete');
        // this.initPostProcessing();
    }

    async highlightBadLines() {
        console.log('Starting highlightBadLines');
        const badLineIndices = this.logic.highlightBadLines();
        console.log(`Got ${badLineIndices.length} spheres to highlight`);

        if (badLineIndices.length > 0) {
            console.log('Sample of indices to highlight:', badLineIndices.slice(0, 5));
        }
        
        const animationPromises = badLineIndices.map(index => {
            const sphere = this.spheresData[index];
            return new Promise((resolve) => {
                sphere.isAnimating = true;
                gsap.to(sphere.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.3,
                    ease: "elastic.out(1, 0.3)",
                    onUpdate: () => {
                        this.updateSphereMatrix(sphere, index);
                    },
                    onComplete: () => {
                        sphere.isAnimating = false;
                        resolve();
                    }
                });
            });
        });
    
        await Promise.all(animationPromises);
        console.log('Finished highlighting all lines');
        return badLineIndices;
    }
    
    async resetCameraPosition() {
        const originalPosition = new THREE.Vector3(0, -4000, 750);
        
        return new Promise((resolve) => {
            gsap.to(this.camera.position, {
                x: originalPosition.x,
                y: originalPosition.y,
                z: originalPosition.z,
                duration: 0.3,
                ease: "power2.inOut",
                onUpdate: () => {
                    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                },
                onComplete: resolve
            });
        });
    }
    
    update(deltaTime) {
        // this.updateScanLine(deltaTime);
        this.control.update(deltaTime);
        // this.highlightIntersectedSpheres();
    }
    
    highlightIntersectedSpheres() {
        const threshold = 50;
        const newHighlightedSpheres = new Set();
    
        this.spheresData.forEach((sphere, index) => {
            if (visibilityManager.isSphereVisible(sphere)) {
                const distance = - (Math.abs(sphere.position.x - this.scanLinePosition));
                if (distance < threshold) {
                    newHighlightedSpheres.add(index);
                    if (!this.highlightedSpheres.has(index)) {
                        this.highlightSphere(index);
                    }
                }
            }
        });
    
        // Reset spheres that are no longer highlighted
        this.highlightedSpheres.forEach(index => {
            if (!newHighlightedSpheres.has(index)) {
                this.resetSphereAppearance(index);
            }
        });
    
        this.highlightedSpheres = newHighlightedSpheres;
    }

    highlightSphere(index) {
        const sphere = this.spheresData[index];
        sphere.scale.set(1.5, 1.5, 1.5);
        this.spheres.setColorAt(index, new THREE.Color(0x00ffff));
        this.updateSphereMatrix(sphere, index);
    }

    resetSphereAppearance(index) {
        const sphere = this.spheresData[index];
        sphere.scale.set(1, 1, 1);
        this.updateSphereMatrix(sphere, index);
        this.updateSphereColor(sphere, index);
    }

    updateSphereColor(sphere, index) {
        SphereOps.updateSphereColor(sphere, this.spheres, index);
    }

    updateSphereMatrix(sphere, index) {
        SphereOps.updateSphereMatrix(sphere, this.spheres, index);
    }
}