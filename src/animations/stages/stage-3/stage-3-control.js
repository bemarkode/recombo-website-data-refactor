import { store } from '../../modules/store.js';


export class Stage3Control {
    constructor(spheres, spheresData,logic, visualization, stageObserver) {
        this.stageObserver = stageObserver;
        this.logic = logic;
        this.visualization = visualization;
        this.spheresData = spheresData
        this.spheres = spheres
    }


    update() {
      
        store.setFlowSpeed(0.0);



        this.visualization.updateVisuals();
    }
}

    // Add any Stage 3 specific control methods here
