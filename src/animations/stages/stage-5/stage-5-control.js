// stage-4-control.js
import { store } from '../../modules/store.js';
import * as SphereOps from '../../modules/sphere-operations.js';

export class Stage5Control {
    constructor(spheres, spheresData, logic, visualization) {
        this.logic = logic;
        this.visualization = visualization;
        this.spheresData = spheresData;
        this.spheres = spheres;
    }

    update() {
        const flowSpeed = store.getFlowSpeed();

        // Update sphere positions based on flow
        this.spheresData.forEach((sphere, index) => {
            if (!sphere.isAnimating) {
                SphereOps.updateSpherePosition(sphere, flowSpeed);
                
                if (SphereOps.isSphereAtReset(sphere)) {
                    SphereOps.resetSphere(sphere, index, this.spheresData);
                }
            }
        });

        this.visualization.updateVisuals();
    }
}
