
import * as SphereOps from '../../modules/sphere-operations.js';
import { store } from '../../modules/store.js';

export class Stage3Visualization {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData;
        this.spheres = spheres;
        this.scene = store.getScene();
    }

    updateVisuals() {
        this.spheresData.forEach((sphere, index) => {
            this.updateSphereColor(sphere, index);
            // this.updateSphereMatrix(sphere, index);
        });
    }

    updateSphereColor(sphere, index) {
        SphereOps.updateSphereColor(sphere, this.spheres, index);
    }

    updateSphereMatrix(sphere, index) {
        SphereOps.updateSphereMatrix(sphere, this.spheres, index);
    }
}