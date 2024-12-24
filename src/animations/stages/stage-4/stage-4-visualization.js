// stage-4-visualization.js

import * as SphereOps from '../../modules/sphere-operations.js';
import { store } from '../../modules/store.js';

export class Stage4Visualization {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData;
        this.spheres = spheres;
        this.scene = store.getScene();
    }

    updateVisuals() {
        this.spheresData.forEach((sphere, index) => {
            this.updateSphereColor(sphere, index);

        });

    }

    updateSphereColor(sphere, index) {
        SphereOps.updateSphereColorByHeight(sphere, this.spheres, index);
        this.spheres.instanceColor.needsUpdate = true;
    }



    applyHeightColors() {
        this.spheresData.forEach((sphere, index) => {
            this.updateSphereColor(sphere, index);
        });
        this.spheres.instanceColor.needsUpdate = true;
    }
}