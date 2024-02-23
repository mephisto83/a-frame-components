import { useEffect, useState } from 'react';

type MyCustomEventDetail = {
    // Define the structure of your custom event detail here
    // Example:
    message: string;
};

// The hook can optionally accept a callback to be executed when the event is triggered
const useCustomEventListenerAsync = <T extends any>(eventName: string, callback: (detail: T) => Promise<void>) => {
    useEffect(() => {
        // Event handler to call the provided callback
        const handler = async (event: CustomEvent<T>) => {
            await callback(event.detail);
        };

        // Add event listener
        window.addEventListener(eventName, handler as EventListener);

        // Clean up
        return () => {
            window.removeEventListener(eventName, handler as EventListener);
        };
    }, [callback]); // Re-run the effect if the callback changes
};
// The hook can optionally accept a callback to be executed when the event is triggered
export const useCustomEventListener = <T extends any>(eventName: string, callback: (detail: T) => void) => {
    const [value, setValue] = useState(null)
    useEffect(() => {
        // Event handler to call the provided callback
        const handler = (event: CustomEvent<T>) => {
            callback(event.detail);
            setValue(event.detail);
        };

        // Add event listener
        window.addEventListener(eventName, handler as EventListener);

        // Clean up
        return () => {
            window.removeEventListener(eventName, handler as EventListener);
        };
    }, [callback]); // Re-run the effect if the callback changes
    return { detail: value }
};

export default useCustomEventListenerAsync;
