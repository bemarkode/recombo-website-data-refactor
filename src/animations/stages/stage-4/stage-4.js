

import { store } from '../../modules/store.js';

import { stageConfigs } from '../../modules/stage-config.js';
// import * as SphereOps from '../../modules/sphere-operations.js';
import { Stage4Logic } from './stage-4-logic.js';
import { Stage4Visualization } from './stage-4-visualization.js';
import { Stage4Control } from './stage-4-control.js';



export class Stage4 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();
        this.config = stageConfigs.stage4;
        this.logic = new Stage4Logic(spheres, spheresData);
        this.visualization = new Stage4Visualization(spheres, spheresData);
        this.control = new Stage4Control(spheres, spheresData, this.logic, this.visualization, this.stageObserver);
  
        this.targetCameraPosition = {
            y: -5500,  // Adjust these values as needed
            z: 1100
        };
        this.isTransitioning = true;
    }

    async transitionFromPrevious() {

        
        console.log('Stage4: Starting transition from Stage 3');
        
        
        
        // Clean up and prepare for Stage 4
        await this.spheresData.forEach(sphere => {
            sphere.scale.set(1, 1, 1);
            
        });
        this.control.state = 0
        this.control.lastActionTime = 0
        this.isTransitioning = false;
        this.update()
        console.log('Stage4: Transition complete');
    }

    update(deltaTime) {
        if (this.isTransitioning) {
            return;
        }
        // Regular update logic
        this.control.update(deltaTime);
    }

    async transitionToPrevious() {
        console.log('Stage4: Preparing to transition to Stage 3');
        await this.spheresData.forEach(sphere => {
            sphere.scale.set(1, 1, 1);
        });
        // Reset the height data
        await this.logic.resetHeights();
        
        this.isTransitioning = true;
        // Remove scan line
        console.log('Stage4: Ready for Stage 3');
    }

    async transitionToNext() {
        console.log('Stage4: Preparing to transition to next stage');
        this.isTransitioning = true;
        this.logic.resetHeights();
        
        // this.control.update()
        // Perform any necessary cleanup or preparation
        console.log('Stage4: Ready for next stage');
    }

    async transitionFromNext() {
        this.control.state = 0;
        // this.spheres = store.getSpheres()
        // this.spheresData = store.getSpheresData()
        this.isTransitioning = false;
        console.log('Stage4: Starting transition from next stage');
        // Perform any necessary cleanup or preparation
        // this.update();
        console.log('Stage4: Transition complete');
    }
}