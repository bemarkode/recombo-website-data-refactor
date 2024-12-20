import * as SphereOps from '../../modules/sphere-operations.js';
import { surface } from '../../modules/surface.js';
import { store } from '../../modules/store.js';

export class Stage1Logic {
    constructor(spheres, spheresData, ) {
        this.spheresData = spheresData
        this.scanningActive = false;
        this.scanningProgress = 0;
    }

    initializeStage() {
        this.scanningActive = true;
        this.scanningProgress = 0;
    }

    updateSphereStates() {
        const flowSpeed = store.getFlowSpeed();
        this.spheresData.forEach((sphere, index) => {
            SphereOps.updateSpherePosition(sphere, flowSpeed, surface);
            if (SphereOps.isSphereAtReset(sphere)) {
                SphereOps.resetSphere(sphere, index, this.spheresData, surface);
            }
        });
    }

    async startScanning(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        sphere.scanned = true;
        return await this.handleLogic(sphereIndex);
    }

    async handleLogic(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        if (sphere.status === 'good') {
            return { action: 'moveDown', spheres: [sphereIndex], scannedSpheres: [sphereIndex] };
        }

        const { result, badSpheres, scannedSpheres } = this.propagate(sphereIndex);

        if (result === 'repaired') {
            return { action: 'repair', spheres: badSpheres, scannedSpheres };
        } else {
            return { action: 'moveDown', spheres: badSpheres, scannedSpheres };
        }
    }

    propagate(startSphereIndex) {
        const toScan = [startSphereIndex];
        const scannedSpheres = new Set();
        const badSpheres = [];
    
        while (toScan.length > 0) {
            const currentIndex = toScan.pop();
            const sphere = this.spheresData[currentIndex];
    
            if (scannedSpheres.has(currentIndex) || !sphere.visible) continue;
            scannedSpheres.add(currentIndex);
    
            if (sphere.status === 'bad') {
                badSpheres.push(currentIndex);
                const neighbors = [this.getSphereLeft(currentIndex), this.getSphereRight(currentIndex)];
                neighbors.forEach((neighbor) => {
                    if (neighbor && !scannedSpheres.has(neighbor.index)) {
                        toScan.push(neighbor.index);
                    }
                });
            }
        }
    
        const result = this.shouldRepair(badSpheres, scannedSpheres) ? 'repaired' : 'not repaired';
        return { result, badSpheres, scannedSpheres: Array.from(scannedSpheres) };
    }

    shouldRepair(badSpheres, scannedSpheres) {
        return badSpheres.length > 0 && scannedSpheres.size >= 2;
    }

    getSphereLeft(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        const col = sphere.col;
        if (col === 0) {
            return this.spheresData[sphere.index + 4900];
        } else {
            return this.spheresData[sphere.index - 70];
        }
    }

    getSphereRight(sphereIndex) {
        const sphere = this.spheresData[sphereIndex];
        const col = sphere.col;
        if (col === 69) {
            return this.spheresData[sphere.index - 4900];
        } else {
            return this.spheresData[sphere.index + 70];
        }
    }

    repair(sphereIndices) {
        for (const index of sphereIndices) {
            this.spheresData[index].status = 'good';
        }
    }
}