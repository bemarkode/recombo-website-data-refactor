import { Stage1 } from '../stages/stage-1/stage-1.js';
import { Stage2 } from '../stages/stage-2/stage-2.js';
import { Stage3 } from '../stages/stage-3/stage-3.js';
import { Stage4 } from '../stages/stage-4/stage-4.js';
import { Stage5 } from '../stages/stage-5/stage-5.js';
import { Stage6 } from '../stages/stage-6/stage-6.js';
import { Stage7 } from '../stages/stage-7/stage-7.js';
import { StageObserver } from './stage-observer.js';
import { visibilityManager } from './visibility-manager.js';
import { gsap } from 'gsap/dist/gsap';
import   ScrollTrigger  from 'gsap/ScrollTrigger.js'

gsap.registerPlugin(ScrollTrigger);

export class StageManager {
    constructor(spheres, spheresData) {
        this.spheresData = spheresData;
        this.currentStageIndex = 0;
        this.stageObserver = new StageObserver();
        this.stages = [
            new Stage1(spheres, spheresData, this.stageObserver),
            new Stage2(spheres, spheresData, this.stageObserver),
            new Stage3(spheres, spheresData, this.stageObserver),
            new Stage4(spheres, spheresData, this.stageObserver),
            new Stage5(spheres, spheresData, this.stageObserver),
            new Stage6(spheres, spheresData, this.stageObserver),
            new Stage7(spheres, spheresData, this.stageObserver),
        ];
        this.stageObserver.updateStage(this.currentStageIndex);
        this.setupScrollTrigger();
        this.isTransitioning = false;
    }


    setupScrollTrigger() {
        let currentStageIndex = this.currentStageIndex;
        const numStages = this.stages.length;
        gsap.timeline({
            scrollTrigger: {
                trigger: "#animation-container",
                start: "top-=70px top",
                end: `+=${7 * 100}%`,
                pin: true,
                fastScrollEnd: true,
                preventOverlaps: true,
                markers: true,
                onRefresh: () => {
                    // This will run on page load and every time the screen size changes
                    ScrollTrigger.clearScrollMemory();
                    window.history.scrollRestoration = "manual";
                },
                onUpdate: self => {
                    const scrollProgress = (self.progress - 1/numStages) / (1 - 1/numStages);
                    let targetStage = 1 + Math.floor(scrollProgress * (numStages - 1));
                
                    if (targetStage !== currentStageIndex && targetStage >= -1 && targetStage < numStages) {
                        const isScrollingUp = self.direction === -1;
                        
                        // Use GSAP's delayedCall for immediate execution
                        gsap.delayedCall(0, async () => {
                            if (!this.isTransitioning) {
                                this.isTransitioning = true;
                                if (isScrollingUp) {
                                    await this.transitionToPreviousStage();
                                } else {
                                    await this.transitionToNextStage();
                                }
                                currentStageIndex = targetStage;
                                this.updateObserver();
                                this.isTransitioning = false;
                            }
                        });
                    }
                }
            }  
        });
    }


    async transitionToNextStage() {
        if (this.currentStageIndex < this.stages.length - 1) {
            console.log(`Transitioning from Stage ${this.currentStageIndex + 1} to Stage ${this.currentStageIndex + 2}`);
            await this.stages[this.currentStageIndex].transitionToNext();
            this.currentStageIndex++;
            await visibilityManager.transitionToStage(`stage${this.currentStageIndex + 1}`);
            console.log(`Visibility transition complete. Now in Stage ${this.currentStageIndex + 1}`);
            await this.stages[this.currentStageIndex].transitionFromPrevious();
            this.updateObserver();
        }
    }

    async transitionToPreviousStage() {
        if (this.currentStageIndex > 0) {
            console.log(`Transitioning from Stage ${this.currentStageIndex + 1} to Stage ${this.currentStageIndex}`);
            await this.stages[this.currentStageIndex].transitionToPrevious();
            this.currentStageIndex--;
            await visibilityManager.transitionToStage(`stage${this.currentStageIndex + 1}`);
            console.log(`Visibility transition complete. Now in Stage ${this.currentStageIndex + 1}`);
            await this.stages[this.currentStageIndex].transitionFromNext();
            this.updateObserver();
        }
    }

    updateObserver() {
        
        this.stageObserver.updateStage(this.currentStageIndex);
        
    }

    update(deltaTime) {
        visibilityManager.updateVisibility(this.spheresData);
        this.stages[this.currentStageIndex].update(deltaTime);
    }


}