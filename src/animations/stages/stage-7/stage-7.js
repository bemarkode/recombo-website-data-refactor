import { store } from '../../modules/store.js';
// import * as THREE from 'three';
import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
// import { surface } from '~/animations/modules/surface.js';
// import { HeightController } from '../../modules/height-operations.js';
// import { SankeyController } from '~/animations/modules/sankey-controller.js';
import { gsap } from 'gsap';

export class Stage7 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();
        this.config = stageConfigs.stage7;
        this.isTransitioning = true;
    }

    async transitionFromPrevious() {
        store.setFlowSpeed(0);
        this.spheresData.forEach(sphere => {
            gsap.to(sphere, {
                u: 0.5,
                v: 0.5,
                z: 0,
                duration: 2,
                ease: 'power2.inOut'
            });
            gsap.to(sphere.position, {
                z: 0,
                duration: 2,
                ease: 'power2.inOut'
            });
        })
        this.isTransitioning = false;
    }

    async transitionToPrevious() {
        this.spheresData.forEach(sphere => {
            gsap.to(sphere, {
                u: sphere.initU,
                v: sphere.initV,
                z: sphere.initZ,
                duration: 2,
                ease: 'power2.inOut'
            });
            gsap.to(sphere.position, {
                z: sphere.initPositionZ,
                duration: 2,
                ease: 'power2.inOut'
            });
        })

    }

    async transitionToNext() {

    }

    async transitionFromNext() {

    }

    update() {
        if (this.isTransitioning) return;
        this.spheresData.forEach(sphere => {
            
            SphereOps.updateSpherePosition(sphere, store.getFlowSpeed());
        })

    }
}