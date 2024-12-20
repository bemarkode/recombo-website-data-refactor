// stage-4-control.js
// import { store } from '../../modules/store.js';
import * as SphereOps from '../../modules/sphere-operations.js';
import { gsap } from 'gsap';


export class Stage4Control {
    constructor(spheres, spheresData, logic, visualization) {
        this.logic = logic;
        this.visualization = visualization;
        this.spheresData = spheresData;
        this.spheres = spheres;
        this.lastActionTime = 0; // Tracks the last time an action occurred
        this.state = 0; // Tracks the current state in the sequence
        this.rootCauseX = 0;
        this.rootCauseY = 0;
    }


    update() {
        const now = performance.now(); // High-resolution timestamp

        // Update visuals
        this.visualization.updateVisuals();

        // Check the state and time since the last action
        if (this.state === 0 && now - this.lastActionTime > 500) {
            // First action: Generate random height
            this.generateRandomHeight();
            this.lastActionTime = now;
            this.state = 1; // Move to the next state
        } else if (this.state === 1 && now - this.lastActionTime > 1000) {
            // Second action: Find root cause (1 second after generate)
            this.scaleUpBasedOnDistance( this.rootCauseX, this.rootCauseY );
            this.lastActionTime = now;
            this.state = 2; // Move to the next state
        } else if (this.state === 2 && now - this.lastActionTime > 1000) {
            // Third action: Scaele Up root cause (1.5 seconds after root cause)
            this.findRootCause();
            this.lastActionTime = now;
            this.state = 3; // Move to the next state
        } else if (this.state === 3 && now - this.lastActionTime > 1000) {
            // Third action: Scaele Up root cause (1.5 seconds after root cause)
            this.scaleUpRootCause();
            this.lastActionTime = now;
            this.state = 4; // Move to the next state
        } else if (this.state === 4 && now - this.lastActionTime > 1000) {
            // Third action: Reset heights (1.5 seconds after root cause)
            
            // CENTRALIZE THE HEIGHT DOWN
            this.logic.resetHeights(); 
            this.spheresData.forEach(element => {
                element.scale.set(1, 1, 1);
            })
            this.lastActionTime = now;
            this.state = 0; // Reset to the first state
        }
    }

    scaleUpRootCause() {
        this.spheresData.filter(element => element.realRow === this.rootCauseX && element.col === this.rootCauseY).forEach(element => {
            gsap.to(element.scale, { x: 8, y: 8, z: 8, duration: 0.5, ease: "power2.inOut" });
            gsap.to(element.position, {  z: element.position.z + 200, duration: 0.5, ease: "power2.inOut" });
        });
    }

    generateRandomHeight() {
        // this.rootCauseX = Math.floor(Math.random() * 40) + 15;
        // this.rootCauseY = Math.floor(Math.random() * 40) + 15;
        this.rootCauseX = 45;
        this.rootCauseY = 15;
        this.logic.generateHeightAt(this.rootCauseX, this.rootCauseY);
    }

    findRootCause() {

        
        // Get visible spheres and metadata
        const { spheres: visibleSpheres } = SphereOps.getVisibleSpheresArray(this.spheresData);
    
        // Map rootCauseX and rootCauseY to normalized rows/columns
    

        // this.scaleUpBasedOnDistance(this.rootCauseX, this.rootCauseY);
    
        // Filter and animate the row
        const rowElements = visibleSpheres.filter(element => element.realRow === this.rootCauseX);
        this.animateRow(rowElements, this.rootCauseY);
    
        // Filter and animate the column
        const colElements = visibleSpheres.filter(element => element.col === this.rootCauseY);
        this.animateCol(colElements, this.rootCauseX);
    }

    scaleUpBasedOnDistance(rootCauseX, rootCauseY) {
        // Get visible spheres and metadata
        const { spheres: visibleSpheres } = SphereOps.getVisibleSpheresArray(this.spheresData);

        // Calculate distances from the root cause for each element
        const distances = visibleSpheres.map(element => ({
            element,
            distance: Math.abs(element.realRow - rootCauseX) + Math.abs(element.col - rootCauseY),
        }));

        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);

        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;

        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 1.5 * (0.5 + 3*delay),
                y: 1.5 * (0.5 + 3*delay),
                z: 1.5 * (0.5 + 3*delay),
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });

        });
    }
    
    animateRow(rowElements, rootCauseY) {

    
        // Calculate distances from the root cause for each element
        const distances = rowElements.map(element => ({
            element,
            distance: Math.abs(element.col - rootCauseY),
        }));
    

    
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);

    
        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;
    
        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 4,
                y: 4,
                z: 4,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    }
    
    animateCol(colElements, rootCauseX) {

        
      
    
        // Log initial column elements

    
        // Calculate distances from the root cause for each element
        const distances = colElements.map(element => {

            
            

            const distance = Math.abs(element.realRow - rootCauseX);
            
            return {
                element,
                distance,
            };
        });
        console.log('Distances:', distances);
        // Check if distances are calculated

    
        // Sort elements by distance
        distances.sort((a, b) => b.distance - a.distance);
    
        // Log sorted distances
        console.log('Sorted Distances:', distances.map(d => ({
            element: d.element,
            row: d.element.currentRow,
            distance: d.distance,
        })));
    
        // Get the max distance
        const maxDistance = distances[0]?.distance || 0;

    
        // Animate elements with a stagger based on their distance
        distances.forEach(({ element, distance }) => {
            const delay = (0.5 * (maxDistance - distance)) / maxDistance;

            gsap.to(element.scale, {
                x: 4,
                y: 4,
                z: 4,
                duration: 0.1,
                delay,
                ease: "power2.inOut",
            });
        });
    

    }
    
    
    
}

