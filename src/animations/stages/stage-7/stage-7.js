import { store } from '../../modules/store.js';
import * as THREE from 'three';
import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
// import { surface } from '~/animations/modules/surface.js';
// import { HeightController } from '../../modules/height-operations.js';
// import { SankeyController } from '~/animations/modules/sankey-controller.js';
import { gsap } from 'gsap';
// import { createSpheresOnSurface } from '../../modules/spheres-grid.js';


export class Stage7 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();

        this.config = stageConfigs.stage7;
        this.isTransitioning = true;
        this.positionData = []
    }

    async transitionFromPrevious() {

        store.setFlowSpeed(3/4900);

        this.spheresData.forEach(sphere => {
            gsap.to(sphere, {
                u: sphere.row / 70,
                v: sphere.col / 70,
                duration: 0.5,
                ease: 'power2.inOut'
            });
            gsap.to(sphere.position, {
                z: 0,
                duration: 0.5,
                ease: 'power2.inOut'
            });
        });

        let model = this.scene.getObjectByName('360 Model');
        model.position.set(150, 0, 0)
        model.visible = true;
        gsap.to(model.scale, {
            x: 150000,
            y: 150000,
            z: 150000,
            duration: 2,
            ease: 'power2.inOut'
        });
        console.log(model);
        
        this.isTransitioning = false;
    }

    async transitionToPrevious() {
        let model = this.scene.getObjectByName('360 Model');
        model.visible = false
        this.spheresData.forEach(sphere => {
            gsap.to(sphere, {
                v: sphere.row / 70,
                u: sphere.col / 70,
                duration: 0.5,
                ease: 'power2.inOut'
            })
            SphereOps.updateSpherePosition(sphere, store.getFlowSpeed())
    })
    
        this.isTransitioning = true;

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