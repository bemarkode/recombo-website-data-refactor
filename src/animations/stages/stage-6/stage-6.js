import { store } from '../../modules/store.js';
import * as THREE from 'three';
import { stageConfigs } from '../../modules/stage-config.js';
import * as SphereOps from '../../modules/sphere-operations.js';
import { HeightController } from '../../modules/height-operations.js';
import { SankeyController } from '~/animations/modules/sankey-controller.js';
import { gsap } from 'gsap';
import { surface } from '~/animations/modules/surface.js';

export class Stage6 {
    constructor(spheres, spheresData, stageObserver) {
        this.stageObserver = stageObserver;
        this.spheres = spheres;
        this.spheresData = spheresData;
        this.scene = store.getScene();
        this.camera = store.getCamera();
        this.config = stageConfigs.stage6;
       
        this.lastActionTime = 0; // Tracks the last time an action occurred
        this.state = 0; // Tracks the current state in the sequence
        this.rootCauseX = 0;
        this.rootCauseY = 0;

        
        this.renderer = store.getRenderer();


        this.targetCameraPosition = {
            x: 0,
            y: 0,
            z: 0
        };
        this.heightController = new HeightController(spheresData);
        this.isTransitioning = true;
        // this.sankeyController = new SankeyController(spheresData);

    }

    async transitionFromPrevious() {
        this.heightController.resetHeights();
        
        const timeline = gsap.timeline();
        
        // First scale all spheres to 1
        this.spheresData.forEach(element => {
            timeline.to(element.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<"); // Use "<" to make all scale-downs happen simultaneously
        });
        
        // Wait for scale-down to complete before starting spreadRisk
        timeline.call(() => this.spreadRisk(), null, "+=0"); // "+=0" ensures previous animations complete
        
        this.isTransitioning = false;
        return timeline;
    }
    

async spreadRisk() {
    console.log("ima working here");

    this.spheresData.forEach(element => {
        const randomNumber = Math.random();

        let color = new THREE.Color(0x00ff00); // Default to green (no risk)


        if (randomNumber < 0.5) {
            element.risk = 'none';
        } else if (randomNumber < 0.8) {
            element.risk = 'low';
            color = new THREE.Color(0xffff00); // Yellow
            // scale = 1.25;
            // zPosition = 200;
        } else if (randomNumber < 0.95) {
            element.risk = 'mid';
            color = new THREE.Color(0xffa500); // Orange
            // scale = 1.5;
            // zPosition = 400;
        } else {
            element.risk = 'high';
            color = new THREE.Color(0xff0000); // Red
            // scale = 2;
            // zPosition = 600;
        }

        element.color = color;

        // gsap.to(element.position, {
        //     z: zPosition,
        //     duration: 0.5,
        //     ease: "power2.inOut"
        // });
        // gsap.to(element.scale, {
        //     x: scale,
        //     y: scale,
        //     z: scale,
        //     duration: 0.5,
        //     ease: "power2.inOut"
        // });

        this.spheres.setColorAt(element.index, color);
    });

    this.spheres.instanceColor.needsUpdate = true;
    console.log(this.spheresData);

}


    async transitionToPrevious() {
        this.spheresData.forEach(sphere => {
            sphere.v = sphere.row / 70
            sphere.u = sphere.col / 70
            gsap.to(sphere.position,
                {
                    z: 0, 
                    duration: 0.5, 
                    ease: "power2.inOut" 
                }
            )
        })
        

        this.isTransitioning = true;
    }

    async transitionToNext() {
        this.isTransitioning = true;
    }
    
    async transitionFromNext() {
        // const matrix = new THREE.Matrix4();
        // const position = new THREE.Vector3();
        // const gridWidth = this.spheresData.width
        // const gridHeight = this.spheresData.height
        // const totalSpheres = gridHeight * gridWidth
        // for (let i = 0; i < totalSpheres; i++) {
        //     const row = Math.floor(i / gridWidth);
        //     const col = i % gridWidth;
            
        //     // Calculate UV coordinates
        //     const u = col / (gridWidth - 1);
        //     const v = row / (gridHeight - 1);
    
        //     const realIndex =  i
        //     const realRow = Math.floor(realIndex / gridWidth)
            

        //     surface.getPoint(u, v, position)
        //     matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(1,1,1))
        //     this.spheres.setMatrixAt(i, matrix)

        //     const status = Math.random() < 0.75 ? 'good' : 'bad';
                    
        //             // Store grid coordinates with sphere data
        //         if (row !== 70) {
        //             this.spheresData.push({
        //                 index: i,
        //                 row: row,
        //                 col: col,
        //                 u: u,
        //                 v: v,
        //                 status: status,
        //                 visible: true,
        //                 position: position.clone(),
        //                 color: new THREE.Color(0xffffff),
        //                 isAnimating: false,
        //                 scale: new THREE.Vector3(1, 1, 1),
        //                 rotation: new THREE.Quaternion(),
        //                 scanned: false,
        //                 realIndex: realIndex,
        //                 realRow: realRow
        
        
        //             });
        //         }
        //         this.spheres.instanceMatrix.needsUpdate = true;
            
        // }
        
        store.setFlowSpeed(3/4900);
        this.isTransitioning = false;
    }
    update() {
        if (this.isTransitioning) return;

        this.spheresData.forEach(sphere => {
            SphereOps.updateSpherePositionRisk(sphere, store.getFlowSpeed());
        });

        // this.divideRisk();
    }
}