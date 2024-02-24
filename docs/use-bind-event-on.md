# `useBindEventOn` Hook Documentation

The `useBindEventOn` React hook dynamically binds an event listener to a DOM element and sets an attribute on the element with the value returned by a function when the event is triggered. This hook leverages the power of React's `useEffect`, `useState`, and `useRef` hooks for its implementation. It is built on top of a custom hook named `useEventListenerOn`, which handles the attachment of event listeners to elements that match a specified CSS selector.

## Usage

```jsx
import React from 'react';
import { useBindEventOn } from './path/to/useBindEventOn';

function MyComponent() {
    // Example usage of useBindEventOn
    const { [`frame-id`]: frameId } = useBindEventOn(
        'click', // Event name
        'data-clicked', // Attribute to set on event trigger
        (event) => `Clicked at ${new Date().toISOString()}`, // Function to generate the attribute value
        '.clickable' // CSS selector to target elements (optional)
    );

    return (
        <div>
            {/* Dynamically bind event to elements matching the selector */}
            <div className="clickable">Click me</div>
        </div>
    );
}
```

## Parameters

The `useBindEventOn` hook accepts the following parameters:

- **`evtName`**: A string specifying the name of the event to listen for (e.g., `'click'`, `'mouseover'`).

- **`attributeName`**: The name of the attribute to set on the targeted element when the event is triggered.

- **`getFunction`**: A function that is called when the event is triggered. This function receives the event object as its argument and should return the value to be set for the specified attribute.

- **`initSelector`** (optional): A CSS selector string used to initially target elements. If not provided, the hook generates a unique identifier and sets a corresponding attribute selector.

## Return Value

The hook returns an object containing a single property, `frame-id`, which holds the unique identifier value if `initSelector` is not provided. This `frame-id` can be used to target the element in subsequent operations or for debugging purposes.

## Implementation Details

- The `useEventListenerOn` custom hook is used internally to manage event listeners. It takes care of adding and removing event listeners to prevent memory leaks and ensure that the most recent event handler is used.

- A `MutationObserver` is utilized to dynamically attach event listeners to elements that match the selector but are added to the DOM after the hook's initialization.

- The hook automatically generates a unique ID and sets an attribute selector if `initSelector` is not specified. This feature enables targeting dynamically created elements without a predefined class or ID.

## Best Practices

- Use this hook for dynamically added elements or when you need to attach event listeners based on complex conditions that CSS selectors alone cannot handle.

- Ensure the `getFunction` callback is optimized for performance, especially if the event is triggered frequently (e.g., `mousemove`).

- Remember to use CSS selectors that accurately target the desired elements to prevent unnecessary event bindings.

This documentation provides a comprehensive overview of how to use the `useBindEventOn` hook in your React projects for dynamic event handling and attribute manipulation based on event triggers.