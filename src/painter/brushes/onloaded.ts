export default function onloaded(callback: () => void): void {
    let fired = false;
    function onDomLoaded() {
        const sceneEl: any = document.querySelector('a-scene');
        fired = true;

        // Check if sceneEl is not null before accessing its properties
        if (sceneEl) {
            if (sceneEl.hasLoaded) {
                callback();
            } else {
                // Ensure that the callback is not invoked immediately
                sceneEl.addEventListener('loaded', () => callback());
            }
        } else {
            console.error('a-scene element not found');
        }
    }

    if (document.readyState === 'complete' || (document as any).readyState === 'loaded') {
        onDomLoaded();
    } else {
        document.addEventListener('DOMContentLoaded', onDomLoaded);
        setTimeout(() => {
            if (!fired) {
                onDomLoaded();
            }
        }, 1000)
    }
}
