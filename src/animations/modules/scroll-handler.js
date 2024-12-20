// scroll-handler.js

export function initContainerScrollHandler(containerId) {
    const container = document.getElementById(containerId);
    
    // Prevent scroll on wheel events
    container.addEventListener('wheel', event => {
        event.preventDefault();
    }, { passive: false });

    // Prevent scroll on touch events (for mobile)
    container.addEventListener('touchmove', event => {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    // Prevent scroll when mouse enters container
    container.addEventListener('mouseenter', () => {
        document.body.style.overflow = 'hidden';
    });

    // Re-enable scroll when mouse leaves container
    container.addEventListener('mouseleave', () => {
        document.body.style.overflow = 'auto';
    });

    // Prevent default drag behavior
    container.addEventListener('dragstart', event => {
        event.preventDefault();
    });

    // Optional: Add visual cursor indication
    container.style.cursor = 'grab';
    container.addEventListener('mousedown', () => {
        container.style.cursor = 'grabbing';
    });
    container.addEventListener('mouseup', () => {
        container.style.cursor = 'grab';
    });
}