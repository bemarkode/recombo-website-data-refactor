import { store } from '../../modules/store.js';
import * as SphereOps from '../../modules/sphere-operations.js';


export class Stage2Control {
    constructor(spheres, spheresData,logic, visualization, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.logic = logic;
        this.visualization = visualization;
        this.isScanning = false;

    }

    update() {
        this.updateSphereStates();
        this.checkForScanning();
    }

    updateSphereStates() {
        const flowSpeed = store.getFlowSpeed();
    
        this.spheresData.forEach((sphere, index) => {
            if (!sphere.isAnimating) {
                SphereOps.updateSpherePosition(sphere, flowSpeed);
    
                if (SphereOps.isSphereAtReset(sphere)) {
                    // const resetSphere = SphereOps.resetSphere(sphere, index, this.spheresData);
                    // this.visualization.updateSphereAfterReset(resetSphere, index);
                    SphereOps.resetSphere(sphere, index, this.spheresData);
                }
            }
    


        });
    

        this.visualization.updateVisuals();
    }

    checkForScanning() {
        const flowSpeed = store.getFlowSpeed(); // Get the current flow speed
        let sphereCounter = 0;
    
        for (let i = 0; i < this.spheresData.length; i++) {
            const sphere = this.spheresData[i];
            
            if (i % this.spheresData.width === 0) sphereCounter++;
    
            if (SphereOps.shouldSphereBeScanned(sphere, flowSpeed, sphereCounter))  {
                
                this.startScanning(i);
                break;
            }
        }
    }

    async stopScanning() {
        // Indicate that scanning has been cancelled
        this.isScanning = false;
        this.isScanningCancelled = true;
    
        // Stop the flow
        store.setFlowSpeed(0);
    
        // Clear any ongoing animations in visualization
    
        // Reset spheresData
        this.spheresData.forEach(sphere => {
            sphere.scanned = false;
            sphere.isAnimating = false;
            sphere.scale.set(1, 1, 1);
            sphere.highlightedIssue = false;
            // Reset other properties if needed
        });
    
        // Update sphere colors and matrices
        this.visualization.updateVisuals();
    
        // Optionally, reset the flow speed
        // store.setFlowSpeed(3 / 4900); // Or set it to 0 if needed
    }
    

    async startScanning(sphereIndex) {
        this.isScanning = true;
        this.isScanningCancelled = false;
    
        console.log('Starting scanning', sphereIndex);
        store.setFlowSpeed(0); // Stop the flow
    
        const { result, badSpheres, scannedSpheres } = this.logic.propagate(sphereIndex);
    
        if (this.isScanningCancelled) return;
    
        await this.handleScanningVisualization(scannedSpheres);
    
        if (this.isScanningCancelled) return;
    
        if (result === 'repaired') {
            await this.repairSpheres(badSpheres);
        }
    
        if (this.isScanningCancelled) return;
    
        await this.highlightUndetectedIssues(scannedSpheres);
    
        if (this.isScanningCancelled) return;
    
        await this.visualization.animateAllSpheresDown(scannedSpheres);
    
        await new Promise(resolve => setTimeout(resolve, 200));
        this.isScanning = false;
        store.setFlowSpeed(3 / 4900); // Restart the flow
    }
    
    
    

    async handleScanningVisualization(scannedSpheres) {
        for (const index of scannedSpheres) {
            if (this.isScanningCancelled) break;
    
            const sphere = this.logic.spheresData[index];
            await this.visualization.animateSphereUp(index);
            await this.visualization.createScanningSphere(index);
            sphere.scanned = true;
            this.visualization.updateSphereColor(sphere, index);
        }
    }
    

    async repairSpheres(sphereIndices) {
        if (this.isScanningCancelled) return;
    
        this.logic.repair(sphereIndices);
    
        for (const index of sphereIndices) {
            if (this.isScanningCancelled) break;
    
            const sphere = this.logic.spheresData[index];
            this.visualization.updateSphereColor(sphere, index);
        }
    
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    async highlightUndetectedIssues(scannedSpheres) {
        if (this.isScanningCancelled) return;
        const leftmostScannedIndex = Math.min(...scannedSpheres);
        const undetectedBadSpheres = [];

        // Find all bad spheres to the right of the scanned area
        for (let i = leftmostScannedIndex - 1; i >= Math.max(leftmostScannedIndex - 2000, 0); i--) {
            const sphere = this.spheresData[i];
            if (sphere.status === 'bad' && sphere.visible) {
                undetectedBadSpheres.push(i);
            }
        }

        // Highlight the undetected bad spheres
        const highlightPromises = undetectedBadSpheres.map(index => 
            this.visualization.highlightUndetectedSphere(index)
        );

        await Promise.all(highlightPromises);
    }

    resetState() {
        this.spheresData.forEach(sphere => {
            sphere.scanned = false;
            sphere.isAnimating = false;
            sphere.scale.set(1, 1, 1);
            sphere.highlightedIssue = false;
            // Reset other properties if needed
        });
    
        this.visualization.updateVisuals();
    }
}