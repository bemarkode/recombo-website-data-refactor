import { store } from '../../modules/store.js';

import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
import { HeightController } from '../../modules/height-operations.js';
import { SankeyController } from '~/animations/modules/sankey-controller.js';
// import { gsap } from 'gsap';

export class Stage6 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();
        this.config = stageConfigs.stage6;
       
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
        this.sankeyController = new SankeyController(spheresData);
    }

    transitionFromPrevious() {
        console.log("HELLO FROM TRANSITION TO 6");
        this.heightController.resetHeights();
        this.spheresData.forEach(element => {
            element.scale.set(1,1,1)
            SphereOps.updateSphereColorByHeight(element, this.spheres, element.index)
            this.spheres.instanceColor.needsUpdate = true
        });
        this.isTransitioning = false;
        
    }

    transitionToPrevious() {
        this.isTransitioning = true;
    }

    transitionToNext() {
        this.isTransitioning = true;
    }
    
    transitionFromNext() {
        this.isTransitioning = false;
    }
    update() {
        if (this.isTransitioning) return;


        this.sankeyController.transformToSankeyOriginalSpacing();
    }
}