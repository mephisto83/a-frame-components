import { useEffect } from 'react';

type CallbackFunction = () => void;

export const useSceneLoaded = (callback: CallbackFunction) => {
    useEffect(() => {
        const onDomLoaded = () => {
            const sceneEl: any = document.querySelector('a-scene');

            if (!sceneEl) {
                console.warn('a-scene element not found');
                return;
            }

            if (sceneEl.hasLoaded) {
                callback();
            } else {
                sceneEl.addEventListener('loaded', callback);
                // Cleanup event listener
                return () => {
                    sceneEl.removeEventListener('loaded', callback);
                };
            }
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive' || (document as any).readyState === 'loaded') {
            onDomLoaded();
        } else {
            document.addEventListener('DOMContentLoaded', onDomLoaded);
            // Cleanup event listener
            return () => {
                document.removeEventListener('DOMContentLoaded', onDomLoaded);
            };
        }
    }, [callback]); // Dependency array contains callback to re-run if callback changes
};
