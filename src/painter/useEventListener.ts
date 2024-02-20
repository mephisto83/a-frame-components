import { useEffect, RefObject } from 'react';

// Define the hook's type parameters: T is the type of the HTML element, E is the type of the event.
function useEventListener<T extends HTMLElement>(
    ref: RefObject<T>,
    eventName: string,
    callback: (event: any) => void
): void {
    useEffect(() => {
        // Ensure the ref current is not null and event is provided.
        const element = ref.current;
        if (!element || !eventName) return;

        // The event listener that calls the callback.
        const eventListener = (event: Event) => callback(event);

        // Attach the event listener.
        element.addEventListener(eventName, eventListener);

        // Remove the event listener on cleanup.
        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [ref, eventName, callback]); // Dependency array includes ref, eventName, and callback.
}

// Helper type to map event types to the corresponding HTML elements.
interface HTMLElementEventMap {
    click: MouseEvent;
    mouseenter: MouseEvent;
    // ... add other event types as needed
}

export default useEventListener;
