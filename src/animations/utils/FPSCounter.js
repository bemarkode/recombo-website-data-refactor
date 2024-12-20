export class FPSCounter {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.fpsElement = this.createFPSElement();
    }

    createFPSElement() {
        const fpsElement = document.createElement('div');
        fpsElement.id = 'fpsCounter';
        fpsElement.style.position = 'fixed';
        fpsElement.style.top = '10px';
        fpsElement.style.left = '10px';
        fpsElement.style.color = 'black';
        fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        fpsElement.style.padding = '5px';
        fpsElement.style.borderRadius = '5px';
        fpsElement.style.fontFamily = 'Arial, sans-serif';
        fpsElement.style.fontSize = '14px';
        fpsElement.style.zIndex = '1000';
        return fpsElement;
    }

    update() {
        this.frames++;
        const time = performance.now();
        if (time >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (time - this.lastTime));
            this.lastTime = time;
            this.frames = 0;
            this.fpsElement.textContent = `FPS: ${this.fps}`;
        }
    }

    addToContainer(container) {
        container.appendChild(this.fpsElement);
    }
}