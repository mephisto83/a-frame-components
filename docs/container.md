# `frame-container` A-Frame Component Documentation

The `frame-container` component is designed for A-Frame, a web framework for building virtual reality experiences. This component automatically arranges child entities based on specified layout properties such as alignment, direction, and margin, making it easier to create structured and responsive VR layouts.

## Usage

To use the `frame-container` component, add it to an A-Frame entity in your scene. This entity will then act as a container for other child entities, arranging them based on the component's properties.

```html
<frame-container alignment="center" justifyContent="flexStart" direction="vertical" margin="1 1 1 1">
  <!-- Child entities here -->
</frame-container>
```

### Schema

- **width** (number, default: `0`): Specifies the width of the container. This can dynamically update based on the content.
- **height** (number, default: `0`): Specifies the height of the container. This can dynamically update based on the content.
- **alignment** (string, default: `'flexStart'`): Determines the alignment of child entities along the cross-axis. Options are `'flexStart'`, `'flexEnd'`, and `'center'`.
- **justifyContent** (string, default: `'flexStart'`): Determines the distribution of child entities along the main-axis. Options are `'flexStart'`, `'flexEnd'`, and `'center'`.
- **direction** (string, default: `'horizontal'`): Specifies the layout direction of child entities. Options are `'vertical'` and `'horizontal'`.
- **margin** (string, default: `'0 0 0 0'`): Specifies the margin around the container in the format "top right bottom left".

### Methods

- **parseMargin**: Parses the margin string into a numeric object.
- **calculateAndApplyPositions**: Calculates and applies positions to all child entities based on the current schema properties.
- **expandBoundingBoxByObject**: Helper function to calculate the bounding box of an object, including all its descendants.
- **onChildrenChanged**: Listener for changes in child entities to recalculate positions.
- **getWidth / getHeight**: Returns the current width/height of the container.
- **updateElementSize**: Updates the size attributes of the container entity and emits a `size-update` event if there are changes.

### Events

- **size-update**: Emitted on the container entity whenever its size is updated. The event detail includes the new `width` and `height`.

## Example

```html
<a-scene>
  <frame-container alignment="center" justifyContent="flexStart" direction="vertical" margin="0.5 0.5 0.5 0.5" position="0 1.5 -4">
    <a-box position="0 0 0" width="1" height="1" depth="1" color="#F00"></a-box>
    <a-sphere position="0 2 0" radius="0.5" color="#0F0"></a-sphere>
  </frame-container>
</a-scene>
```

In this example, a `frame-container` is used to vertically arrange a box and a sphere with a margin around each entity. The container adjusts its size and position based on its child entities, maintaining the layout structure within the VR scene.