# `frame-slider` Component Usage Documentation

The `frame-slider` component is a customizable slider component designed for graphical user interfaces. It allows for extensive customization to fit the design requirements of various applications. Below is the documentation on how to use and customize the `frame-slider` component.

## Properties

- **`active-color`**: (Optional) The color of the slider when it is active. Example: `"#FF0000"`.
- **`background-color`**: (Optional) The background color of the slider. Example: `"#FFFFFF"`.
- **`targetbarsize`**: (Optional) The size of the target bar. Accepts both string and number values. Example: `10`.
- **`title-text-font`**: (Optional) The font of the title text. Path to the font file. Example: `"assets/fonts/Plaster-Regular.ttf"`.
- **`percentage-text-font`**: (Optional) The font of the percentage text. Path to the font file. Example: `"assets/fonts/Plaster-Regular.ttf"`.
- **`border-color`**: (Optional) The color of the border. Example: `"#000000"`.
- **`handle-color`**: (Optional) The color of the slider handle. Example: `"#333333"`.
- **`orientation`**: (Optional) The orientation of the slider, either `"horizontal"` or `"vertical"`.
- **`handle-inner-depth`**, **`handle-inner-radius`**, **`handle-outer-depth`**, **`handle-outer-radius`**: (Optional) Customization properties for the slider handle, including its depth and radius. Accepts both string and number values.
- **`title-position`**: (Optional) The position of the title relative to the slider. Example: `"top"`.
- **`title-scale`**: (Optional) The scale of the title text. Accepts both string and number values.
- **`hover-color`**: (Optional) The color of the slider when hovered. Example: `"#AAAAAA"`.
- **`left-right-padding`**, **`top-bottom-padding`**: (Optional) Padding on the sides or top/bottom of the slider. Accepts both string and number values.
- **`title`**: (Optional) The title of the slider. Example: `"Volume"`.
- **`margin`**: (Optional) The margin around the slider. Example: `"5px"`.
- **`percent`**: (Optional) The initial percentage value of the slider. Accepts both string and number values. Example: `50`.
- **`slider-bar-depth`**, **`slider-bar-height`**: (Optional) Customization properties for the slider bar, including its depth and height. Accepts both string and number values.
- **`bar-length`**, **`bar-thickness`**: (Required) The length and thickness of the slider bar. Accepts both string and number values.

## Example Usage

Below is an example of how to integrate the `frame-slider` component into your project:

```html
<frame-slider
    title="Volume Control"
    orientation="horizontal"
    active-color="#FFD700"
    background-color="#F0F0F0"
    border-color="#D3D3D3"
    handle-color="#FF8C00"
    bar-length="300"
    bar-thickness="5"
    hover-color="#FFFACD"
    percent="30"
    title-position="top"
    title-text-font="assets/fonts/Plaster-Regular.ttf"
    percentage-text-font="assets/fonts/Plaster-Regular.ttf"
></frame-slider>
```

## Customizing `frame-slider`

To customize the `frame-slider` component, modify its properties as needed to fit the design and functional requirements of your application. The component's flexibility allows for a wide range of visual styles and behaviors.

Remember to include the necessary assets, such as font files, and ensure they are correctly pathed in your project's directory structure.

For any additional or undocumented properties (`[propName: string]: any;`), you can pass custom attributes to further customize the slider's appearance or behavior. This catch-all property ensures that the `frame-slider` component can adapt to future requirements or integrate with other systems seamlessly.