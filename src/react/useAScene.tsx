import { useEffect, useState } from 'react';

// Custom hook to get the A-Frame scene element
const useAScene = () => {
    const [scene, setScene] = useState(null);

    useEffect(() => {
        // Function to find the a-scene element
        const findAScene = () => {
            const aSceneElement = document.querySelector('a-scene');
            setScene(aSceneElement);
        };

        // Check if A-Frame is loaded and then find the a-scene
        if ((window as any).AFRAME) {
            findAScene();
        } else {
            // If A-Frame isn't loaded yet, add an event listener
            window.addEventListener('load', findAScene);
        }

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('load', findAScene);
        };
    }, []);

    return scene;
};

export default useAScene;
