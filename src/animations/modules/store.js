

// store.js
class Store {
    constructor() {
        this.state = {
            renderer : null,
            camera : null,
            flowSpeed: 3 / 4900, // Default flow speed,
            scene: null,
            visibilityRange: { u: { min: 0, max: 0.5 }, v: { min: 0, max: 0.2 } },
            targetVisibilityRange: { u: { min: 0, max: 0.5 }, v: { min: 0, max: 0.2 } },
            spheresData: [],
        };
    }

    setRenderer(renderer) {
        this.state.renderer = renderer;
    }

    getRenderer() {
        return this.state.renderer;
    }

    setFlowSpeed(speed) {
        this.state.flowSpeed = speed;
    }

    setCamera(camera) {
        this.state.camera = camera;
    }

    getCamera() {
        return this.state.camera;
    }

    getFlowSpeed() {
        return this.state.flowSpeed;
    }

    setScene(scene) {
        this.state.scene = scene;
    }

    getScene() {
        return this.state.scene;
    }
    setVisibilityRange(range) {
        this.state.visibilityRange = range;
    }

    getVisibilityRange() {
        return this.state.visibilityRange;
    }

    setTargetVisibilityRange(range) {
        this.state.targetVisibilityRange = range;
    }

    getTargetVisibilityRange() {
        return this.state.targetVisibilityRange;
    }

    updateVisibilityRange(interpolatedRange) {
        this.state.visibilityRange = interpolatedRange;
    }

    getSpheresData() { return this.state.spheresData }

    setSpheresData(spheresData) { this.state.spheresData = spheresData }

    getSpheres() { return this.state.spheres }

    setSpheres(spheres) { this.state.spheres = spheres }

    getModel() {
        return this.state.model
    }

    setModel(model) {
        this.state.model = model
        console.log("hello from store", model);
    }
}

export const store = new Store();