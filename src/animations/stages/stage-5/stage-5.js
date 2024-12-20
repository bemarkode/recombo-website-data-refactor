// import * as THREE from 'three';

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
		
		this.isTransitioning = false;
        // Initialize height disturbance after transitions are complete


        this.visualization.applyHeightColors();
        store.setFlowSpeed(18/4900);
        
        this.update();
        console.log('Stage5: Transition complete');
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
            const startX = this.spheresData[0].currentRow
            console.log("startX", startX);
            this.generateHeightAtStartInstantly(startX);
            this.lastActionTime = now;
            this.state = 1; // Move to the next state
        } else if (this.state === 1 && now - this.lastActionTime > 1000) {
            // Second action: Find root cause (1 second after generate)
            this.findRootCause();
            this.lastActionTime = now;
            this.state = 2; // Move to the next state
        } else if (this.state === 2 && now - this.lastActionTime > 1500) {
            // Third action: Reset heights (2.5 seconds after root cause)
            
            // CENTRALIZE THE HEIGHT DOWN
            this.logic.resetHeights(); 
            this.spheresData.forEach(element => {
                element.scale.set(1, 1, 1);
            })
            this.lastActionTime = now;
            this.state = 0; // Reset to the first state
        }
        

    }

    findRootCause() {

        
        // Get visible spheres and metadata
        const { spheres: visibleSpheres } = SphereOps.getVisibleSpheresArray(this.spheresData);
    
        // Map rootCauseX and rootCauseY to normalized rows/columns
        // const normalizedRootCauseX = metadata.rowMapping.get(this.rootCauseX);
        
        const normalizedRootCauseY = this.rootCauseY / this.spheresData.width;
    

    
        // Filter and animate the row
        const rowElements = visibleSpheres.filter(element => element.currentRow === 27);
        this.animateRow(rowElements, normalizedRootCauseY);
    
        // Filter and animate the column
        const colElements = visibleSpheres.filter(element => element.col === this.rootCauseY);
        this.animateCol(colElements, this.rootCauseX);
    }
    
    animateRow(rowElements, rootCauseY) {

    
        // Calculate distances from the root cause for each element
        const distances = rowElements.map(element => ({
            element,
            distance: Math.abs(element.normalizedCol - rootCauseY),
        }));
    

    
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);

    
        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;
    
        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 2,
                y: 2,
                z: 2,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    }
    
    animateCol(colElements, rootCauseX) {

        
      
    
        // Log initial column elements

    
        // Calculate distances from the root cause for each element
        const distances = colElements.map(element => {

            
            

            const distance = Math.abs(element.currentRow + 70 - rootCauseX);
            
            return {
                element,
                distance,
            };
        });
        console.log('Distances:', distances);
        // Check if distances are calculated

    
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);
    
        // Log sorted distances
        console.log('Sorted Distances:', distances.map(d => ({
            element: d.element,
            row: d.element.currentRow,
            distance: d.distance,
        })));
    
        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;

    
        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 2,
                y: 2,
                z: 2,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    

    }

    generateHeightAtStart(startX) {

        this.rootCauseY = Math.floor(Math.random() * 70);
        this.logic.generateHeightAt(70 - startX, this.rootCauseY);
    }

    generateHeightAtStartInstantly(startX) {

        this.rootCauseY = Math.floor(Math.random() * 70);
        this.logic.generateHeightAtInstantly(70 - startX, this.rootCauseY);
    }


}