import { HeightController } from '../../modules/height-operations.js';

export class Stage5Logic {
    constructor(spheres, spheresData) {
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.heightController = new HeightController(this.spheresData);
    }

    initializeHeights() {
        // Generate height disturbance at the center of the grid
        this.heightController.generateHeightDisturbance(35, 35);
    }

    // Method for generating heights at specific coordinates
    generateHeightAt(row, col) {
        this.heightController.generateHeightDisturbance(row, col);
    }

    generateHeightAtInstantly(row, col) {
        this.heightController.generateHeightDisturbanceInstantly(row, col);
    }
    
    async resetHeights() {
        this.heightController.resetHeights();
    }
}