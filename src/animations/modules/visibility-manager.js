// visibility-manager.js
import { store } from './store.js';
import { stageConfigs, initialStage } from './stage-config.js';
import { gsap } from 'gsap';

class VisibilityManager {
    constructor() {
        this.visibilityRange = { u: { min: 0, max: 1 }, v: { min: 0, max: 1 } };
        this.initializeVisibilityRange();
    }

    initializeVisibilityRange() {
        this.visibilityRange = { ...stageConfigs[initialStage].visibilityRange };
        store.setVisibilityRange(this.visibilityRange);
    }

    async transitionVisibilityRange(newRange, duration = 0.3) { // Match duration with camera
        console.log('Starting visibility transition', this.visibilityRange, 'to', newRange);
        return new Promise((resolve) => {
            gsap.to(this.visibilityRange.u, {
                min: newRange.u.min,
                max: newRange.u.max,
                duration: duration,
                ease: "power2.inOut",
                onUpdate: () => this.updateStore()
            });

            gsap.to(this.visibilityRange.v, {
                min: newRange.v.min,
                max: newRange.v.max,
                duration: duration,
                ease: "power2.inOut",
                onUpdate: () => this.updateStore(),
                onComplete: () => {
                    console.log('Visibility transition complete', this.visibilityRange);
                    resolve();
                }
            });
        });
    }

    updateStore() {
        store.setVisibilityRange({ ...this.visibilityRange });
    }

    async transitionToStage(stageName) {
        console.log(`Starting visibility transition to ${stageName}`);
        const newRange = stageConfigs[stageName].visibilityRange;
        await this.transitionVisibilityRange(newRange);
        console.log(`Completed visibility transition to ${stageName}`);
    }

    isSphereVisible(sphere) {
        const range = this.visibilityRange;
        return (
            sphere.u >= range.u.min &&
            sphere.u <= range.u.max &&
            sphere.v >= range.v.min &&
            sphere.v <= range.v.max &&
            sphere.row !== 70
        );
    }

    updateSphereVisibility(sphere) {
        sphere.visible = this.isSphereVisible(sphere);
        return sphere.visible;
    }

    updateVisibility(spheresData) {
        spheresData.forEach(sphere => {
            this.updateSphereVisibility(sphere);
        });
    }


}

export const visibilityManager = new VisibilityManager();