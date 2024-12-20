import { store } from './store.js';
import { gsap } from 'gsap';

export function createFlowController() {
  let flowTimeline = gsap.timeline({ paused: true });

  function setFlowSpeed(speed, duration = 0) {
    flowTimeline.to({}, {
      duration: duration,
      onUpdate: () => {
        store.setFlowSpeed(speed);
      },
      ease: 'power2.inOut',
    });
  }

  function startFlow() {
    setFlowSpeed(3 / 4900, 0.5); // Adjust speed and duration as needed
    flowTimeline.play();
  }

  function stopFlow() {
    setFlowSpeed(0, 0.5); // Adjust duration as needed
    flowTimeline.play();
  }

  function getFlowSpeed() {
    return store.getFlowSpeed();
  }

  // Return only the necessary functions
  return {
    startFlow,
    stopFlow,
    getFlowSpeed,
    setFlowSpeed
  };
}