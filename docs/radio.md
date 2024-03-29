# `frame-radio` Primitive

The `frame-radio` primitive is a custom element in A-Frame for creating radio button interfaces within a VR environment. This primitive leverages the `radiocomponent` to handle its functionality, providing a seamless integration with other A-Frame entities.

## Usage

To use the `frame-radio` primitive, include it within your A-Frame scene like any other A-Frame entity. The `frame-radio` is specifically designed to work with the `radiocomponent`, allowing for easy specification of options and values directly through HTML attributes.

### Example

```html
<a-scene>
  <frame-radio options='[{"text": "Apple", "value": "A"}, {"text": "Banana", "value": "B"}, {"text": "Cherry", "value": "C"}]' value="Option2"></frame-radio>
</a-scene>
```

## Attributes

The `frame-radio` primitive supports the following attributes, which map directly to the `radiocomponent` properties:

- **options**: A JSON array of objects, each representing an option with text, value.
- **value**: The currently selected value from the options list.

### `options`

Specifies the available options within the radio group. This should be a string of comma-separated values representing each choice.

**Example**: `options='[{"text": "Apple", "value": "A"}, {"text": "Banana", "value": "B"}, {"text": "Cherry", "value": "C"}]'`

### `value`

Determines the initially selected value when the scene loads. This should match one of the options provided in the `options` attribute.

**Example**: `value="A"`

## Details

When registering the `frame-radio` primitive, the following components and mappings are established:

- **defaultComponents**: This section defines the default components that are attached to the primitive. For `frame-radio`, the `radiocomponent` is attached by default.
  
- **mappings**: Mappings are used to connect primitive attributes to specific component properties. For `frame-radio`, the `options` and `value` attributes are mapped to `radiocomponent.options` and `radiocomponent.value` respectively.

This structure allows for easy customization and integration of the `frame-radio` primitive within A-Frame scenes, providing a user-friendly interface for VR radio button functionality.

## Conclusion

The `frame-radio` primitive extends A-Frame's capabilities by introducing an easy-to-use interface for creating radio button groups within VR environments. By leveraging the `radiocomponent`, it offers developers a straightforward way to incorporate selection mechanics into their VR experiences.
