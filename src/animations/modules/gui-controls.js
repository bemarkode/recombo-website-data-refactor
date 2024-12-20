// gui-controls.js

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { store } from './store.js';

export class GUIController {
    constructor() {
        this.gui = new GUI();
        this.camera = store.getCamera();
        this.scene = store.getScene();
        this.renderer = store.getRenderer();
        this.composer = null;
        this.bokehPass = null;
        
        this.params = {
            // Camera parameters
            cameraX: this.camera.position.x,
            cameraY: this.camera.position.y,
            cameraZ: this.camera.position.z,
            lookAtX: 0,
            lookAtY: 0,
            lookAtZ: 0,
            
            // Depth of Field parameters
            focus: 500.0,
            aperture: 0.025,
            maxblur: 0.01,
            enabled: true
        };

        this.initPostProcessing();
        this.initGUI();
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bokehParams = {
            focus: this.params.focus,
            aperture: this.params.aperture,
            maxblur: this.params.maxblur,
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.bokehPass = new BokehPass(this.scene, this.camera, bokehParams);
        this.bokehPass.enabled = this.params.enabled;
        this.composer.addPass(this.bokehPass);
    }

    initGUI() {
        // Camera Position Folder
        const cameraFolder = this.gui.addFolder('Camera Position');
        cameraFolder.add(this.params, 'cameraX', -10000, 10000).onChange(this.updateCamera.bind(this));
        cameraFolder.add(this.params, 'cameraY', -10000, 10000).onChange(this.updateCamera.bind(this));
        cameraFolder.add(this.params, 'cameraZ', -10000, 10000).onChange(this.updateCamera.bind(this));
        
        // Look At Folder
        const lookAtFolder = this.gui.addFolder('Look At Point');
        lookAtFolder.add(this.params, 'lookAtX', -10000, 10000).onChange(this.updateCamera.bind(this));
        lookAtFolder.add(this.params, 'lookAtY', -10000, 10000).onChange(this.updateCamera.bind(this));
        lookAtFolder.add(this.params, 'lookAtZ', -10000, 10000).onChange(this.updateCamera.bind(this));

        // Depth of Field Folder
        const dofFolder = this.gui.addFolder('Depth of Field');
        dofFolder.add(this.params, 'enabled')
            .onChange(value => this.bokehPass.enabled = value);
        dofFolder.add(this.params, 'focus', 0.0, 2000.0)
            .onChange(value => this.bokehPass.uniforms['focus'].value = value);
        dofFolder.add(this.params, 'aperture', 0.0, 0.1)
            .onChange(value => this.bokehPass.uniforms['aperture'].value = value);
        dofFolder.add(this.params, 'maxblur', 0.0, 0.02)
            .onChange(value => this.bokehPass.uniforms['maxblur'].value = value);

        // Add preset buttons
        const presetsFolder = this.gui.addFolder('Camera Presets');
        presetsFolder.add(this, 'setOverviewPreset').name('Overview');
        presetsFolder.add(this, 'setCloseUpPreset').name('Close Up');
        presetsFolder.add(this, 'setSideViewPreset').name('Side View');

        // Start with folders closed
        cameraFolder.close();
        lookAtFolder.close();
        dofFolder.close();
        presetsFolder.close();
    }

    updateCamera() {
        this.camera.position.set(this.params.cameraX, this.params.cameraY, this.params.cameraZ);
        this.camera.lookAt(this.params.lookAtX, this.params.lookAtY, this.params.lookAtZ);
    }

    // Camera position presets
    setOverviewPreset() {
        this.params.cameraX = 0;
        this.params.cameraY = -4000;
        this.params.cameraZ = 750;
        this.params.lookAtX = 0;
        this.params.lookAtY = 0;
        this.params.lookAtZ = 0;
        this.updateCamera();
    }

    setCloseUpPreset() {
        this.params.cameraX = 0;
        this.params.cameraY = -2000;
        this.params.cameraZ = 500;
        this.params.lookAtX = 0;
        this.params.lookAtY = -1000;
        this.params.lookAtZ = 0;
        this.updateCamera();
    }

    setSideViewPreset() {
        this.params.cameraX = 3000;
        this.params.cameraY = -2000;
        this.params.cameraZ = 500;
        this.params.lookAtX = 0;
        this.params.lookAtY = -2000;
        this.params.lookAtZ = 0;
        this.updateCamera();
    }

    // Call this in your render loop
    render() {
        if (this.composer) {
            this.composer.render();
        }
    }

    // Clean up method
    dispose() {
        if (this.gui) {
            this.gui.destroy();
        }
        if (this.composer) {
            this.composer.dispose();
        }
    }
}