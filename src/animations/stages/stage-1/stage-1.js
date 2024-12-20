import { Stage1Logic } from './stage-1-logic.js';
import { Stage1Visualization } from './stage-1-visualization.js';
import { Stage1Control } from './stage-1-control.js';

import { stageConfigs } from '../../modules/stage-config.js';

export class Stage1 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheresData = spheresData;
        this.config = stageConfigs.stage1;
        this.logic = new Stage1Logic(spheres, spheresData, );
        this.visualization = new Stage1Visualization(spheres, spheresData, );
        this.control = new Stage1Control(spheres, spheresData,  this.logic, this.visualization, this.visibilityRange);
    }

    async transitionToNext() {
        
        // this.update()
    }

    async transitionToPrevious() {        
        // this.update()
    }

    async transitionFromNext() {
        // this.update()
    }

    async transitionFromPrevious() {
        // this.update()
    }





    update(deltaTime) {
        
        this.control.update(deltaTime);
    }
}