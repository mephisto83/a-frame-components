# `frame-menu-container` Component Documentation

The `frame-menu-container` is a customizable menu container component for A-Frame, designed to create interactive and flexible menu interfaces in virtual reality (VR) environments. It leverages A-Frame's entity-component system, allowing developers to easily incorporate a GUI menu into their VR projects. This documentation outlines the usage, properties, and customization options for the `frame-menu-container`.

## Usage

To use the `frame-menu-container`, you must first include the A-Frame library and the component's script in your project. After including the necessary scripts, you can add the `frame-menu-container` component to an A-Frame entity within your HTML markup.

### Basic Example

```html
<a-scene>
  <a-entity position="0 1.6 -3">
    <frame-menu-container text-value="Menu" open="true"></frame-menu-container>
  </a-entity>
</a-scene>
```

## Properties

The `frame-menu-container` component provides several properties to customize the appearance and behavior of the menu:

- **flexDirection**: Specifies the direction items are placed in the container. Can be `"row"` or `"column"`.
- **selected**: Index of the initially selected menu item.
- **open**: Controls the visibility of the menu. `true` to open the menu, `false` to close it.
- **justifyContent**: Defines the alignment along the main axis. Can be `"flexStart"`, `"flexEnd"`, or `"center"`.
- **alignItems**: Defines the alignment along the cross axis. Can be `"flexStart"`, `"flexEnd"`, or `"center"`.
- **text**: Text displayed on the menu button that toggles the container open/closed.
- **itemPadding**: Padding around each menu item.
- **menuItemWidth**: Width of each menu item.
- **menuItemMargin**: Margin around each menu item.
- **easing**: Easing function for open/close animations.
- **dur**: Duration of open/close animations in milliseconds.
- **forwardStep**: The step forward when the menu is opened.
- **menuItemHeight**: Height of each menu item.
- **menuDirection**: Direction in which the menu opens. Can be `"up"` or `"down"`.
- **opacity**: Opacity of the menu container background.
- **isTopContainer**: Indicates whether this menu is the top-level container.
- **panelColor**: Color of the menu panel.
- **panelRounded**: Border radius of the menu panel.

### Styling Properties

The `frame-menu-container` also includes a `styles` object for global GUI item styles:

- **fontFamily**: Font family for text within the menu.
- (Additional styling properties commented out in the example code can be added here following the same pattern.)

## Events

The component emits the `open-changed` event when the visibility of the menu changes. You can listen to this event to perform actions based on the menu's open state.

## Customization

You can further customize the `frame-menu-container` by editing its source code. This includes adjusting its layout, styling, and animation properties to better fit your VR experience's needs.

## Advanced Usage

For advanced scenarios, such as dynamically adding menu items or responding to user frame_interactions with menu items, you can access and modify the menu container's children or use A-Frame's event system to add custom behavior.

## Conclusion

The `frame-menu-container` component provides a flexible and easy-to-use solution for adding interactive menus to A-Frame-based VR experiences. By leveraging its customizable properties and listening to its events, developers can create intuitive and immersive VR interfaces.