// camera-controls.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { store } from './store.js';
import gsap from 'gsap';

export class CameraController {
    constructor() {
        this.camera = store.getCamera();
        this.scene = store.getScene();
        this.renderer = store.getRenderer();
        this.domElement = this.renderer.domElement;
        
        // Initialize controls
        this.orbitControls = new OrbitControls(this.camera, this.domElement);
        this.setupOrbitControls();
        
        // Post-processing
        this.composer = null;
        this.bokehPass = null;
        
        // GUI
        this.gui = new GUI();
        this.params = {
            // Camera parameters
            enableOrbitControls: true,
            // Depth of Field parameters
            dofEnabled: true,
            focus: 500.0,
            aperture: 0.025,
            maxblur: 0.01
        };

        this.initPostProcessing();
        this.initGUI();
        this.setupCameraPresets();
    }

    setupOrbitControls() {
        // Configure OrbitControls
        this.orbitControls.enableDamping = true; // Smooth camera movement
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.screenSpacePanning = true;
        
        // Set reasonable limits
        this.orbitControls.minDistance = 100;
        this.orbitControls.maxDistance = 10000;
        
        // Limit vertical rotation
        this.orbitControls.maxPolarAngle = Math.PI * 0.85;
        
        // Optional: add key bindings for different views
        window.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'q': // Top view
                    this.setPresetView('top');
                    break;
                case 'w': // Front view
                    this.setPresetView('front');
                    break;
                case 'e': // Side view
                    this.setPresetView('side');
                    break;
                case 'r': // Reset view
                    this.setPresetView('default');
                    break;
            }
        });
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
        this.bokehPass.enabled = this.params.dofEnabled;
        this.composer.addPass(this.bokehPass);
    }

    initGUI() {
        // Camera Controls folder
        const cameraFolder = this.gui.addFolder('Camera Controls');
        cameraFolder.add(this.params, 'enableOrbitControls')
            .name('Enable Controls')
            .onChange(value => {
                this.orbitControls.enabled = value;
            });

        // Add camera position display
        const posFolder = cameraFolder.addFolder('Camera Position (Read Only)');
        const positionInfo = {
            x: 0, y: 0, z: 0,
            updateDisplay: () => {
                positionInfo.x = Math.round(this.camera.position.x);
                positionInfo.y = Math.round(this.camera.position.y);
                positionInfo.z = Math.round(this.camera.position.z);
            }
        };
        posFolder.add(positionInfo, 'x').listen();
        posFolder.add(positionInfo, 'y').listen();
        posFolder.add(positionInfo, 'z').listen();
        
        // Update position display on camera move
        this.orbitControls.addEventListener('change', () => {
            positionInfo.updateDisplay();
        });

        // Depth of Field folder
        const dofFolder = this.gui.addFolder('Depth of Field');
        dofFolder.add(this.params, 'dofEnabled')
            .name('Enable DOF')
            .onChange(value => {
                this.bokehPass.enabled = value;
            });
        dofFolder.add(this.params, 'focus', 0.0, 2000.0)
            .onChange(value => {
                this.bokehPass.uniforms['focus'].value = value;
            });
        dofFolder.add(this.params, 'aperture', 0.0, 0.1)
            .onChange(value => {
                this.bokehPass.uniforms['aperture'].value = value;
            });
        dofFolder.add(this.params, 'maxblur', 0.0, 0.02)
            .onChange(value => {
                this.bokehPass.uniforms['maxblur'].value = value;
            });
    }

    setupCameraPresets() {
        const presetFolder = this.gui.addFolder('Camera Presets');
        presetFolder.add(this, 'setTopView').name('Top View (Q)');
        presetFolder.add(this, 'setFrontView').name('Front View (W)');
        presetFolder.add(this, 'setSideView').name('Side View (E)');
        presetFolder.add(this, 'setDefaultView').name('Reset View (R)');
    }

    setPresetView(preset) {
        const duration = 1.0; // Animation duration in seconds
        
        let targetPosition, targetLookAt;
        
        switch(preset) {
            case 'top':
                targetPosition = new THREE.Vector3(0, 0, 5000);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                break;
            case 'front':
                targetPosition = new THREE.Vector3(0, -4000, 750);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                break;
            case 'side':
                targetPosition = new THREE.Vector3(4000, -2000, 750);
                targetLookAt = new THREE.Vector3(0, -2000, 0);
                break;
            case 'default':
                targetPosition = new THREE.Vector3(0, -4000, 750);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                break;
        }

        // Animate camera movement
        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(targetLookAt);
                this.orbitControls.target.copy(targetLookAt);
            }
        });
    }

    // Preset view methods (called from GUI)
    setTopView() { this.setPresetView('top'); }
    setFrontView() { this.setPresetView('front'); }
    setSideView() { this.setPresetView('side'); }
    setDefaultView() { this.setPresetView('default'); }

    update() {
        // Update orbit controls
        if (this.orbitControls.enabled) {
            this.orbitControls.update();
        }
    }

    render() {
        if (this.composer) {
            this.composer.render();
        }
    }

    dispose() {
        this.orbitControls.dispose();
        if (this.gui) this.gui.destroy();
        if (this.composer) this.composer.dispose();
    }
}