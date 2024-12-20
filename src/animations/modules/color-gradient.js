import * as THREE from 'three';

export class ColorGradient {
    constructor() {
        this.gradientStops = [
            { color: new THREE.Color(0xc0eeff), position: 0 }, // Cyan
            { color: new THREE.Color(0xff99cc), position: 1 }  // Magenta
        ];
    }

    mapHeightToColor(height, minHeight, maxHeight) {
        const t = (height - minHeight) / (maxHeight - minHeight);
        return this.interpolateGradient(t);
    }

    interpolateGradient(t) {
        let colorA, colorB, positionA, positionB;
        
        for (let i = 0; i < this.gradientStops.length - 1; i++) {
            if (t >= this.gradientStops[i].position && 
                t <= this.gradientStops[i + 1].position) {
                colorA = this.gradientStops[i].color;
                colorB = this.gradientStops[i + 1].color;
                positionA = this.gradientStops[i].position;
                positionB = this.gradientStops[i + 1].position;
                break;
            }
        }

        if (t === 1 || !colorA) {
            return this.gradientStops[this.gradientStops.length - 1].color.clone();
        }

        const segmentT = (t - positionA) / (positionB - positionA);
        return new THREE.Color().lerpColors(colorA, colorB, segmentT);
    }
}