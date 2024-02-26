import { useEffect, useState, useRef } from 'react';
import { generateUniqueId } from '../util';
import { raiseCustomEvent } from './util';

export default function useEventListenerOn(
    evtName: string,
    evtHandler: (event: Event, element: Element) => void,
    initSelector?: string
): { [`frame-id`]: string } {
    const observer = useRef<MutationObserver | null>(null);
    const [selector, setSelector] = useState(initSelector);
    const [selectedId, setSelectId] = useState(null);
    const lastHandler = useRef<(event: Event, element: Element) => void>();

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
                let handler = (evt => {
                    evtHandler(evt, element);
                });
                element.addEventListener(evtName, handler);
                // Update the reference to the current handler
                lastHandler.current = handler;
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

    useEffect(() => {
        if (!initSelector) {
            let id = generateUniqueId();
            setSelectId(id);
            setSelector(`[frame-id="${id}"]`);
        }
        else {
            setSelector(initSelector);
        }
    }, [initSelector])

    return { [`frame-id`]: selectedId }
}


export function raiseOn(props: { [`frame-id`]: string }, eventName: string, details: any) {
    raiseCustomEvent(eventName, details, document.querySelector(`[frame-id="${props['frame-id']}"]`));
}

export function useBindEventOn(
    evtName: string,
    attributeName: string,
    getFunction: (event: Event) => any,
    initSelector?: string
): { [`frame-id`]: string } {
    const res = useEventListenerOn(evtName, (evt: Event, element: Element) => {
        element.setAttribute(attributeName, getFunction(evt));
    }, initSelector)

    return res;
}