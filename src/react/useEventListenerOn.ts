import { useEffect, useRef } from 'react';

export default function useEventListenerOn(
    selector: string,
    evtName: string,
    evtHandler: (event: Event) => void
): void {
    const observer = useRef<MutationObserver | null>(null);
    const lastHandler = useRef<(event: Event) => void>();

    useEffect(() => {
        // Function to safely remove the existing event listener
        const removeEventListener = (element: Element | null) => {
            if (element && lastHandler.current) {
                element.removeEventListener(evtName, lastHandler.current);
            }
        };

        // Function to attach event listener to the element
        const attachEventListener = () => {
            const element = document.querySelector(selector);
            if (element && typeof evtHandler === 'function') {
                // Remove existing event listener if any
                removeEventListener(element);
                // Add the new event listener
                element.addEventListener(evtName, evtHandler);
                // Update the reference to the current handler
                lastHandler.current = evtHandler;
                return element; // Return the element for potential use
            }
        };

        // Initially try attaching the event listener
        const element = attachEventListener();

        if (!element) {
            // Only setup MutationObserver if the element wasn't found initially
            observer.current = new MutationObserver((mutationsList: any, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' || mutation.type === 'subtree') {
                        const foundElement = attachEventListener();
                        if (foundElement) {
                            // If the element is found and event listener is attached, disconnect the observer
                            observer.disconnect();
                            break;
                        }
                    }
                }
            });

            observer.current.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false,
            });
        }

        return () => {
            // Cleanup: Remove the current event listener and disconnect the observer
            if (element) {
                removeEventListener(element);
            }
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [selector, evtName, evtHandler]);
}
