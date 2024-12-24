import * as THREE from 'three';
import { ColorGradient } from './color-gradient.js';
import { gsap } from 'gsap';

export class SankeyController {
    constructor(spheresData) {
        this.spheresData = spheresData;


        // Define group sizes and colors
        this.groups = [
            { size: 10, startRow: 0, color: new THREE.Color(0xff6347) }, // Tomato Red
            { size: 15, startRow: 10, color: new THREE.Color(0x3cb371) }, // Medium Sea Green
            { size: 25, startRow: 25, color: new THREE.Color(0x4169e1) }, // Royal Blue
            { size: 35, startRow: 50, color: new THREE.Color(0x8a2be2) }, // Blue Violet
            { size: 35, startRow: 85, color: new THREE.Color(0x8a2be2) } // Blue Violet
        ];

        // Initialize ColorGradient instance
        this.colorGradient = new ColorGradient();

        // Store original y-spacing
        this.originalYSpacing = this.calculateOriginalYSpacing();

        // Calculate endpoints for each group
        this.groupEndpoints = this.calculateGroupEndpoints();
    }


    calculateOriginalYSpacing() {
        // Assuming first two spheres in same group have the correct spacing
        const sphere1 = this.spheresData[0];
        const sphere2 = this.spheresData[1];
        return Math.abs(sphere1.position.y - sphere2.position.y);
    }

    calculateGroupEndpoints() {
        const gap = 700;
        let currentY = 0;
        return this.groups.map(group => {
            const endpoint = currentY;
            // Add space for the group (maintaining original spacing between height)
            currentY += (group.size - 1) * this.originalYSpacing;
            // Add gap to next group
            currentY += gap;
            return endpoint - 4000;
        });
    }

    getGroupForRow(row) {
        for (let i = 0; i < this.groups.length; i++) {
            if (row < this.groups[i].startRow + this.groups[i].size) {
                return i;
            }
        }
        return -1;
    }

    calculateSCurvePosition(progress, startY, endY) {
        const t = progress;
        // Bezier control points
        const p0 = 0;
        const p1 = 0.2;
        const p2 = 0.8;
        const p3 = 1;
        
        // Cubic bezier formula
        const y = (1 - t) ** 3 * p0 +
                 3 * (1 - t) ** 2 * t * p1 +
                 3 * (1 - t) * t ** 2 * p2 +
                 t ** 3 * p3;
                 
        return startY + (endY - startY) * y;
    }

    applyColorGradient(sphere, progress, groupColor) {
        // White at the start and gradually transitioning to the group's color
        const startColor = new THREE.Color(0xffffff); // White
        const endColor = groupColor;
        const interpolatedColor = new THREE.Color().lerpColors(startColor, endColor, progress);

        // Apply the color to the sphere's material
        if (sphere.material) {
            sphere.material.color = interpolatedColor;
        }
    }

    transformToSankeyOriginalSpacing() {
        this.spheresData.forEach((sphere, index) => {
            const col = Math.floor(index / this.spheresData[0].width);
            const row = index % this.spheresData[0].width;
            const groupIndex = this.getGroupForRow(row);
            
            if (groupIndex !== -1) {
                // Get start Y position
                const startY = sphere.position.y;
                
                // Calculate end Y position
                // Start with group base position
                const groupBaseY = this.groupEndpoints[groupIndex];
                // Add offset based on position within group
                const rowWithinGroup = row - this.groups[groupIndex].startRow;
                const endY = groupBaseY + (rowWithinGroup * this.originalYSpacing);
                
                // Calculate progress through columns
                const progress = col / (this.spheresData[0].width - 1);
                
                // Calculate new Y position using S-curve
                const newY = this.calculateSCurvePosition(progress, startY, endY);
                
                // Animate to new position
                gsap.to(sphere.position, {
                    y: newY,
                    duration: .02,
                    ease: "power2.inOut"
                });
                
                this.applyColorGradient(sphere, progress, this.groups[groupIndex].color);

            }
        });
        this.spheresData.filter(sphere => sphere.row === this.spheresData[0].height - 1).forEach(sphere => sphere.scale.set(0, 0, 0));
    }

    transformToSankeyAdjustedSpacing() {
        // First, calculate the flow width for each group based on number of spheres
        // const flowWidths = this.groups.map(group => (group.size - 1) * this.originalYSpacing);
        
        this.spheresData.forEach((sphere, index) => {
            const col = Math.floor(index / this.spheresData[0].width);
            const row = index % this.spheresData[0].width;
            const groupIndex = this.getGroupForRow(row);
            
            if (groupIndex !== -1) {
                // Calculate relative position within group
                const rowWithinGroup = row - this.groups[groupIndex].startRow;
                
                // Get start Y position
                const startY = sphere.position.y;
                
                // Calculate end Y position
                const groupBaseY = this.groupEndpoints[groupIndex];
                const endY = groupBaseY + (rowWithinGroup * this.originalYSpacing);
                
                // Calculate progress through columns
                const progress = col / (this.spheresData[0].width - 1);
                
                // Calculate new Y position using S-curve
                const newY = this.calculateSCurvePosition(progress, startY, endY);
                
                // Animate to new position
                gsap.to(sphere.position, {
                    y: newY,
                    duration: 2,
                    ease: "power2.inOut"
                });
                this.spheresData.filter(sphere => sphere.row === 69).forEach(sphere => sphere.scale.set(0, 0, 0));
            }
        });
    }

    resetPositions() {
        this.spheresData.forEach(sphere => {
            gsap.to(sphere.position, {
                y: sphere.originalY || sphere.position.y,
                duration: 1,
                ease: "power2.out"
            });
        });
    }
}