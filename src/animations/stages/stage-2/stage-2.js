import { Stage2Logic } from './stage-2-logic.js';
import { Stage2Visualization } from './stage-2-visualization.js';
import { Stage2Control } from './stage-2-control.js';
import { store } from '../../modules/store.js';

import { stageConfigs } from '../../modules/stage-config.js';
import * as THREE from 'three';
import { gsap } from 'gsap';


export class Stage2 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheresData = spheresData;
        this.config = stageConfigs.stage2;
        this.logic = new Stage2Logic(spheres, spheresData);
        this.visualization = new Stage2Visualization(spheres, spheresData);
        this.control = new Stage2Control(spheres, spheresData, this.logic, this.visualization, this.stageObserver);

        this.camera = store.getCamera();
    }

    async transitionToNext() {
        this.zoomOutCamera();
        console.log('Stage2: Preparing to transition to next stage');
        // Perform any necessary cleanup or preparation
        if (this.control.isScanning) {
            await this.control.stopScanning();
        }
        this.control.resetState();

        console.log('Stage2: Ready for next stage');
    }
    async zoomOutCamera() {
        const targetPosition = new THREE.Vector3(
            this.camera.position.x + 2000,
            this.camera.position.y - 1000, // Move the camera back by 1000 units
            this.camera.position.z + 4000  // Move the camera up by 250 units
        );

        return Promise.all([
            new Promise((resolve) => {
                gsap.to(this.camera.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: 0.5, // 0.5 seconds for the transition
                    ease: "power2.inOut",
                    onUpdate: () => {
                        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera keeps looking at the center
                    },
                    onComplete: resolve
                });
            }),
            new Promise((resolve) => {
                gsap.to(this.camera, {
                    left: -2400,
                    right: 2400,
                    top: 1800,
                    bottom: -1800,
                    duration: 0.5, // 0.5 seconds for the transition
                    ease: "power2.inOut",
                    onUpdate: () => {
                        this.camera.updateProjectionMatrix();
                    },
                    onComplete: resolve
                });
            })
        ]);
        


    }

    async zoomInCamera() {
        const targetPosition = new THREE.Vector3(
            this.camera.position.x - 2000,
            this.camera.position.y + 1000, // Move the camera back by 1000 units
            this.camera.position.z - 4000  // Move the camera up by 250 units
        );

        return Promise.all([
            new Promise((resolve) => {
                gsap.to(this.camera.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: 0.5, // 0.5 seconds for the transition
                    ease: "power2.inOut",
                    onUpdate: () => {
                        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera keeps looking at the center
                    },
                    onComplete: resolve
                });
            }),
            new Promise((resolve) => {
                gsap.to(this.camera, {
                    left: -800,
                    right: 800,
                    top: 600,
                    bottom: -600,
                    duration: 0.5, // 0.5 seconds for the transition
                    ease: "power2.inOut",
                    onUpdate: () => {
                        this.camera.updateProjectionMatrix();
                    },
                    onComplete: resolve
                });
            })
        ]);
    }

    async transitionToPrevious() {     

        // this.update()
    }

    async transitionFromNext() {
        this.zoomInCamera();   
        store.setFlowSpeed(3/4900)
        // this.update()
    }

    async transitionFromPrevious() {
        console.log('Stage2: Initializing from previous stage');
        
        // await this.control.initializeFromPrevious();
        // this.update();
        console.log('Stage2: Initialization complete');
    }

    update(deltaTime) {
        
        this.control.update(deltaTime);
    }
}