import * as THREE from 'three';

import { store } from '../../modules/store.js';
// import { visibilityManager } from '../../modules/visibility-manager.js';
import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
import { Stage5Logic } from './stage-5-logic.js';
import { Stage5Visualization } from './stage-5-visualization.js';
import { Stage5Control } from './stage-5-control.js';
import { HeightController } from '../../modules/height-operations.js';
import { gsap } from 'gsap';


export class Stage5 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();
        this.config = stageConfigs.stage5;
        this.logic = new Stage5Logic(spheres, spheresData);
        this.visualization = new Stage5Visualization(spheres, spheresData);
        this.control = new Stage5Control(spheres, spheresData, this.logic, this.visualization, this.stageObserver);
        this.lastActionTime = 0; // Tracks the last time an action occurred
        this.state = 0; // Tracks the current state in the sequence
        this.rootCauseX = 0;
        this.rootCauseY = 0;

        
        this.renderer = store.getRenderer();
        this.row = 0;

        this.targetCameraPosition = {
            x: 0,
            y: 0,
            z: 0
        };
        this.heightController = new HeightController(spheresData);
        this.isTransitioning = true;
    }






    async transitionFromPrevious() {
		console.log('Stage5: Starting transition from Stage 4');
		
		
		
		
        this.spheresData.forEach(sphere => {
			sphere.scale.set(1, 1, 1);
			
        });
		this.spheresData.forEach(sphere => {
			sphere.position.z = 0;
			
		});
        this.state = 0
        this.lastActionTime = 0
		
		this.isTransitioning = false;
        // Initialize height disturbance after transitions are complete


        this.visualization.applyHeightColors();
        store.setFlowSpeed(6/4900);
        
        this.update();
        console.log('Stage5: Transition complete');
        this.isTransitioning = false
    }

    async transitionToPrevious() {
		this.isTransitioning = true;
        console.log('Stage5: Preparing to transition to Stage 4');
        


        // Reset the height data
        this.logic.resetHeights();
        

        

        console.log('Stage5: Ready for Stage 4');
    }

    async transitionToNext() {
        console.log('Stage5: Preparing transition to Stage 6');
        // Perform any necessary cleanup or preparation
        this.isTransitioning = true;
        await this.logic.resetHeights();
        console.log('Stage5: Ready for Stage 6');
    }

    async transitionFromNext() {
        console.log('Stage5: Transitioning from Stage 6');
        // Perform any necessary cleanup or preparation
        this.isTransitioning = false;
        console.log('Stage5: Transition from Stage 6 complete');
    }


    update() {
        if (this.isTransitioning) {
            return;
        }
        // Regular update logic
        this.spheresData.forEach(sphere => {
            SphereOps.updateSpherePosition(sphere, store.getFlowSpeed());
        });
        const now = performance.now(); // High-resolution timestamp

        // Update visuals
        this.visualization.updateVisuals();

        // Check the state and time since the last action
        if (this.state === 0 && now - this.lastActionTime > 2500) {
            // First action: Generate random height
            // const startX = this.spheres[0].currentRow
            // console.log("startX", startX);
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
        if (this.isTransitioning) {
            return;
        }
        const sphere = this.spheresData.find(element => element.realRow === rootCauseX && element.col === rootCauseY);
        gsap.to(sphere.position, { z: 0, duration: 0.5, ease: "power2.inOut" });
        this.spheresData.forEach(element => {
            const distance = Math.sqrt(Math.pow(element.realRow - rootCauseX, 2) + Math.pow(element.col - rootCauseY, 2));
            const delay = .007 * distance + 0.15;
            let moveDownTween = gsap.to(element.position, { z: 0, duration: 0.5, delay: delay, ease: "power2.inOut" });
            let scaleDownTween = gsap.to(element.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: delay, ease: "power2.inOut" });
            if (this.isTransitioning){
                moveDownTween.kill();
                scaleDownTween.kill();
            }
        });

    }

    createScanningSphere(rootCauseX, rootCauseY) {
        if (this.isTransitioning) {
            return;
        }
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
        if (this.isTransitioning) {
            return;
        }
        this.spheresData.filter(element => element.realRow === this.rootCauseX && element.col === this.rootCauseY).forEach(element => {
            element.color = new THREE.Color(0xff00ff);
            console.log("hello");
        });
    }

    scaleUpRootCause() {
        if (this.isTransitioning) {
            return;
        }
        this.spheresData.filter(element => element.realRow === this.rootCauseX && element.col === this.rootCauseY).forEach(element => {
            gsap.to(element.scale, { x: 8, y: 8, z: 8, duration: 0.5, ease: "power2.inOut" });
            gsap.to(element.position, {  z: element.position.z + 200, duration: 0.5, ease: "power2.inOut" });
        });
    }

    generateRandomHeight() {
        if (this.isTransitioning) {
            return;
        }
        this.rootCauseX = Math.floor(Math.random() * 40) + 15;
        this.rootCauseY = Math.floor(Math.random() * 40) + 15;
        // this.rootCauseX = 45;
        // this.rootCauseY = 15;
        this.logic.generateHeightAt(this.rootCauseX, this.rootCauseY);
    }

    scaleUpBasedOnDistance(rootCauseX, rootCauseY) {
        if (this.isTransitioning) {
            return;
        }

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

    findRow(realRow) {
        console.log("realRow, row",realRow, this.spheresData.find(element => element.realRow === realRow).row);
        return this.spheresData.find(element => element.realRow === realRow).row;
    }

    findRootCause() {
        if (this.isTransitioning) {
            return;
        }

        // Filter and animate the row
        const rowElements = this.spheresData.filter(element => element.realRow === this.rootCauseX);
        this.animateRow(rowElements, this.rootCauseY);
    
        // Filter and animate the column
        const colElements = this.spheresData.filter(element => element.col === this.rootCauseY);
        this.animateCol(colElements, this.rootCauseX);
    }
    
    animateRow(rowElements, rootCauseY) {
        if (this.isTransitioning) {
            return;
        }

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
                onUpdate: () => {
                    if (this.isTransitioning) {
                        gsap.killTweensOf(element, "scale");
                    }
                },
                onComplete: () => {
                    if (this.isTransitioning) {
                        gsap.killTweensOf(element, "scale");
                    }
                },
            });
        });
    }
    
    animateCol(colElements, rootCauseX) {
        if (this.isTransitioning) {
            return;
        }

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

    generateHeightAtStart(startX) {
        if (this.isTransitioning) {
            return;
        }

        this.rootCauseY = Math.floor(Math.random() * 70);
        this.logic.generateHeightAt(70 - startX, this.rootCauseY);
    }

    generateHeightAtStartInstantly(x, y) {
        if (this.isTransitioning) {
            return;
        }

        // this.rootCauseY = Math.floor(Math.random() * 70);
        this.logic.generateHeightAtInstantly(x, y);
    }


}