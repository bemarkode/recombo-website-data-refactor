// stage-config.js

export const stageConfigs = {
    stage1: {
        visibilityRange: { u: { min: 0.49, max: 0.5 }, v: { min: 0.4, max: 0.6 } }
    },
    stage2: {
        visibilityRange: { u: { min: 0.49, max: 0.5 }, v: { min: 0.4, max: 0.6 } }
    },
    stage3: {
        visibilityRange: { u: { min: 0.4, max: 0.6 }, v: { min: 0.3, max: 0.7 } }
    },
    stage4: {
        visibilityRange: { u: { min: 0, max: 1 }, v: { min: 0, max: 1 } }
    },
    stage5: {
        visibilityRange: { u: { min: 0, max: 1 }, v: { min: 0, max: 1 } }
    },
    stage6: {
        visibilityRange: { u: { min: 0, max: 1 }, v: { min: 0, max: 1 } }
    },
    stage7: {
        visibilityRange: { u: { min: 0, max: 1 }, v: { min: 0, max: 1 } }
    }
};

export const initialStage = 'stage1';