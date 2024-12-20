import { calculateBezierY } from '../utils/CalculateBezierY.js';
import { gsap } from 'gsap';

export class HeightController {
    constructor(spheresData) {
        this.spheresData = spheresData;
        this.height = 70;
        this.width = 70;
    }

    generateHeightDisturbance(centerRow, centerCol) {
        
        const amplitude = 400;
        const maxDistance = 20;
        const maxDistanceLongitudal = 70;

        const p1 = { x: 0.6, y: 0.0 };
        const p2 = { x: 0.85, y: 0.95 };
        const p3 = { x: 0.6, y: 0.4 };
        const p4 = { x: 0.95, y: 1.0 };

        // Process all spheres in the 70x70 grid
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) { 
                const index = row * this.width + col;
                const sphere = this.spheresData[index];

                const realSphere = this.spheresData[sphere.realIndex]

                // Calculate distances in grid space
                const distRow = Math.min(
                    Math.abs(realSphere.row - centerRow),
                    this.height - Math.abs(realSphere.row - centerRow)
                );
                const distCol = Math.min(
                    Math.abs(col - centerCol),
                    this.width - Math.abs(col - centerCol)
                );

                // Calculate falloff factors
                const distRowInterpolated = distRow < maxDistance ? 1 - distRow / maxDistance : 0;
                const distColInterpolated = distCol < maxDistance ? 1 - distCol / maxDistance : 0;
                const distRowLongitudal = distRow < maxDistanceLongitudal ? 1 - distRow / maxDistanceLongitudal : 0;
                const distColLongitudal = distCol < maxDistanceLongitudal ? 1 - distCol / maxDistanceLongitudal : 0;

                // Calculate falloff using bezier curves
                const falloffRow = calculateBezierY(distRowInterpolated, p1, p2) * 0.8;
                const falloffCol = calculateBezierY(distColInterpolated, p1, p2) * 0.8;
                const falloffRowLong = calculateBezierY(distRowLongitudal, p3, p4) * 0.9;
                const falloffColLong = calculateBezierY(distColLongitudal, p3, p4) * 0.9;

                // Calculate height
                const height = amplitude * (
                    falloffRow * falloffColLong +
                    falloffCol * falloffRowLong
                );

                // Add randomization
                const randomHeight = Math.random() * height * 0.15;
                const finalHeight = height + randomHeight;

                // Apply height to sphere
                if (finalHeight > 0) {
                    sphere.height = finalHeight;
                    gsap.to(sphere.position, {
                        z: sphere.position.z + finalHeight,
                        duration: 1,
                        ease: "power2.out"
                    });
                    
                    
                }
                
            }
        }
        
        
    }
    generateHeightDisturbanceInstantly(centerRow, centerCol) {
        
        const amplitude = 400;
        const maxDistance = 20;
        const maxDistanceLongitudal = 70;

        const p1 = { x: 0.6, y: 0.0 };
        const p2 = { x: 0.85, y: 0.95 };
        const p3 = { x: 0.6, y: 0.4 };
        const p4 = { x: 0.95, y: 1.0 };

        // Process all spheres in the 70x70 grid
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const index = row * this.width + col;
                const sphere = this.spheresData[index];

                // Calculate distances in grid space
                const distRow = Math.min(
                    Math.abs(row - centerRow),
                    this.height - Math.abs(row - centerRow)
                );
                const distCol = Math.min(
                    Math.abs(col - centerCol),
                    this.width - Math.abs(col - centerCol)
                );

                // Calculate falloff factors
                const distRowInterpolated = distRow < maxDistance ? 1 - distRow / maxDistance : 0;
                const distColInterpolated = distCol < maxDistance ? 1 - distCol / maxDistance : 0;
                const distRowLongitudal = distRow < maxDistanceLongitudal ? 1 - distRow / maxDistanceLongitudal : 0;
                const distColLongitudal = distCol < maxDistanceLongitudal ? 1 - distCol / maxDistanceLongitudal : 0;

                // Calculate falloff using bezier curves
                const falloffRow = calculateBezierY(distRowInterpolated, p1, p2) * 0.8;
                const falloffCol = calculateBezierY(distColInterpolated, p1, p2) * 0.8;
                const falloffRowLong = calculateBezierY(distRowLongitudal, p3, p4) * 0.9;
                const falloffColLong = calculateBezierY(distColLongitudal, p3, p4) * 0.9;

                // Calculate height
                const height = amplitude * (
                    falloffRow * falloffColLong +
                    falloffCol * falloffRowLong
                );

                // Add randomization
                const randomHeight = Math.random() * height * 0.15;
                const finalHeight = height + randomHeight;
                console.log("HELLO");
                // Apply height to sphere
                if (finalHeight > 0) {
                    sphere.height = finalHeight;
                    gsap.to(sphere.position, {
                        z: sphere.position.z + finalHeight,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    
                    
                }
                
            }
        }
        
        
    }

    async resetHeights() {
        this.spheresData.forEach(sphere => {
            if (sphere.height) {
                gsap.to(sphere.position, {
                    z: 0,
                    duration: 0.05,
                    ease: "power2.out"
                });
                sphere.height = 0;
            }
        });
    }
}