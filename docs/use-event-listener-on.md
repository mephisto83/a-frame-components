# `useEventListenerOn` Hook Documentation

The `useEventListenerOn` hook allows you to dynamically attach an event listener to a DOM element specified by a selector. This hook is particularly useful in scenarios where the target element may not be immediately available in the DOM.

## Features

- **Dynamic Event Binding:** Attach event listeners to elements that are added to the DOM at a later point.
- **Automatic Cleanup:** Automatically removes event listeners and disconnects the observer on component unmount.
- **Flexible Selector:** Use any valid CSS selector to target elements.

## Usage

1. **Import the Hook**

```jsx
import { useEventListenerOn } from 'a-frame-components';
```

2. **Basic Usage**

Attach an event listener to an element specified by a selector. If the element is not present at the time of the hook's invocation, the hook will observe the DOM for changes and attach the event listener once the element becomes available.

```jsx
function MyComponent() {
  useEventListenerOn('click', () => console.log('Element clicked'), '#my-element');

  return <div id="my-element">Click Me</div>;
}
```

3. **Without Initial Selector**

If the initial selector is not provided, the hook generates a unique ID, sets it as the selector, and returns it. This ID can be used to attach the event listener to a dynamically created element.

```jsx
function MyDynamicComponent() {
  const { [`frame-id`]: frameId } = useEventListenerOn('click', () => console.log('Dynamically created element clicked'));

  return <div id={frameId}>Dynamic Element</div>;
}
```

## Parameters

- `evtName: string` - The name of the event to listen for (e.g., 'click', 'mouseover').
- `evtHandler: (event: Event) => void` - The function to execute when the event is triggered.
- `initSelector?: string` - An optional CSS selector to specify the target element. If omitted, the hook will generate a unique ID and select based on that ID.

## Returns

- An object containing a single property, `frame-id`, which is the unique ID generated by the hook when no initial selector is provided.

## Cleanup

The hook takes care of cleaning up event listeners and disconnecting the MutationObserver when the component unmounts or the dependencies change, ensuring no memory leaks.

## Note

This hook is designed for use in React functional components and requires React 16.8 or higher due to the use of hooks.