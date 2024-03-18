# `frame-base-interactive` Element Documentation

The `frame-base-interactive` element is a versatile component designed for A-Frame environments, allowing developers to easily implement interactive UI elements such as radio buttons, regulators, checkboxes, and icon buttons. This documentation outlines how to utilize `frame-base-interactive` within your A-Frame projects, detailing its properties and usage.

## Overview

`frame-base-interactive` integrates with A-Frame's entity-component system, offering a foundation for creating interactive UI elements that can respond to user inputs. By configuring its properties, you can tailor the behavior and appearance of `frame-base-interactive` to match your specific needs.

## Properties

### Core Properties

- `onclick`: Specifies the action to be performed when the element is clicked.
- `onhover`: Defines the action to occur when the cursor hovers over the element.
- `key-code`: Assigns a keyboard key code that triggers the click action.

### GUI Item Configuration

- `width`: Sets the width of the interactive element.
- `height`: Sets the height of the interactive element.
- `margin`: Defines the margin around the element for spacing purposes.

### Interactive Type

- `interactive-type`: Determines the type of interactive element (`radio`, `checkbox`, `iconButton`, etc.).

### State and Styling

- `on`: Indicates whether the element is in an "on" state.
- `active`: Toggles the active state of the element.
- `checked`: Marks the element as checked (for checkboxes and radio buttons).
- `value`: Holds the value associated with the interactive element.
- `title`: Sets a text title or label for the element.
- `padding-left`: Adjusts the left padding inside the element for content alignment.

### Appearance

- `font-color`: Specifies the color of the text.
- `font-size`: Sets the size of the font.
- `font-family`: Chooses the font family for the text.
- `border-color`: Defines the color of the border.
- `background-color`: Sets the background color.
- `hover-color`: Determines the color when the element is hovered over.
- `active-color`: Sets the color when the element is active.
- `handle-color`: Adjusts the color of the handle (for regulator buttons).
- `radiosizecoef`: Scales the size of the radio button.

## Usage

To use `frame-base-interactive` in your A-Frame scene, add it as a primitive element and configure its properties according to your requirements. Here's a basic example:

```html
<a-scene>
  <frame-base-interactive 
    interactive-type="checkbox"
    onclick="onCheckboxClick"
    width="1"
    height="0.5"
    checked="true"
    title="Accept Terms"
    font-color="#FFF"
    background-color="#007BFF"
    hover-color="#0056b3"
    active-color="#004c8c"
    position="0 1.6 -3">
  </frame-base-interactive>
</a-scene>
```

This example creates a checkbox interactive element with specified dimensions, colors, and behaviors.

## Conclusion

The `frame-base-interactive` element is a powerful tool for A-Frame developers looking to add interactive UI components to their VR experiences. By customizing its wide range of properties, you can create a variety of interactive elements suited to your project's needs.