# AFrame Components Repository

Welcome to the AFrame Components Repository! This collection of custom components is designed to enhance your AFrame-based virtual reality (VR) projects by providing additional functionality, effects, and integrations that are easy to use and integrate.

## Introduction

This repository offers a variety of AFrame components that you can use to create immersive and interactive 3D scenes in the browser. Whether you're building simple VR experiences or complex interactive applications, our components are designed to be flexible, modular, and customizable.

## Features

- **Component 1**: Radio.
- **Component 2**: Container.
- **Component 3**: Menu.

## Installation

To use the components from this repository in your AFrame project, follow these steps:

1. **Include AFrame**: Ensure AFrame is included in your HTML file:

    ```html
    <script src="https://aframe.io/releases/<some version>/aframe.min.js"></script>
    ```

2. **Add Component Scripts**: Include the desired component scripts in your HTML file after including AFrame. You can link directly to the files in this repository (though we recommend downloading or bundling them for production use):

    ```console
    npm install a-frame-components
    ```

## Usage

After installing the components, you can use them in your AFrame scenes by adding them to your entities. Here are some examples:

```react
import { useEffect, useState } from "react";
import { load } from 'a-frame-components';

export default function SpaceShipScene() {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        load().then(() => {
            setLoaded(true);
        });
    }, [])
    if (!loaded) {
        return <></>
    }
    const margin = '.1 .1 .1 .1'
    return (
        <a-scene>
            <a-entity position="0 2.5 -2">
                <a-container direction="vertical" alignment="flexStart" margin={margin}>
                    <a-container direction="horizontal" alignment="flexStart" margin={margin}>
                        <a-menu-container
                            id="menu"
                            forward-step="0.05"
                            text-value="Menu 1 a"
                            menu-direction={'up'}
                            flex-direction="column"
                            justify-content="flexStart"
                            align-items="flexStart"
                            component-padding="0.01"
                            menu-item-height={`.2`}
                            menu-item-width={`1.0`}>
                            <a-base-interactive
                                font-size=".07"
                                value={'word1'}
                                title={'Title 1'}
                                interactive-type={'button'}
                                width={1}
                                height={"0.2"}
                                margin="0 0 0.05 0"
                            />
                        </a-menu-container>
                        ...
```

## API Documentation

For each component, you'll find detailed API documentation below:

### Component 1: `a-radio`

- **Property**: Description and Usage
  - **`options`**: This property is used to specify the options available for selection within the radio component. The data should be passed as a string, and it can potentially be a JSON-encoded string if multiple options are provided. This allows for dynamic generation of radio buttons based on the data provided.
  - **`value`**: The `value` property represents the currently selected option of the radio buttons. It is also a string that corresponds to one of the values specified in the `options` property. This can be used to pre-select an option when rendering the component or to retrieve the current selection.

- **Example**: How to Use This Property
  ```html
  let options = JSON.stringify([{ text: 'Apple',   value: 'A', id: 'A', width: 1 }, { text: 'C',value: 'C',id: 'C',width: 1}]);
  <a-radio id="radio" options={options} value={"A"}></a-radio>
  ```

  In this example, `:options` is bound to an array of strings directly in the template, specifying the available options for the radio buttons. The `v-model` directive is used to create a two-way binding on the `value` property, effectively linking it to `selectedOption` in the component's data. As the user selects different options, `selectedOption` will be updated to reflect the current selection. This approach simplifies handling user input and can be easily extended with additional properties as needed.

Based on the provided description, the `a-container` component seems to be a layout component designed to control the alignment, direction, and spacing of its child elements. Here's a detailed explanation and usage example:

### Component: `a-container`

#### Properties:
- **alignment**: Controls the alignment of child components along the cross axis. Accepts `flexStart`, `flexEnd`, or `center`.
  - **Usage**: This property is useful for aligning items when the container's direction is vertical (aligns horizontally) or horizontal (aligns vertically).

- **direction**: Sets the main axis direction of the container. Accepts `horizontal` or `vertical`.
  - **Usage**: Determines the orientation of child components within the container, either laid out horizontally or vertically.

- **justify-content**: Controls the distribution of child components along the main axis. Accepts `flexStart`, `flexEnd`, or `center`.
  - **Usage**: This property is similar to `alignment` but applies along the main axis, allowing control over the spacing and distribution of children.

- **margin**: Specifies the margin around the container using a shorthand format (top right bottom left).
  - **Usage**: Adjusts the outer spacing of the container, allowing it to be positioned more precisely within its parent or among siblings.

#### Example:
To use the `a-container` component for creating a layout with vertically centered items, distributed evenly along the main axis, and with a specific margin around the container, you might define it like this:

```javascript
'a-container': {
  alignment: 'center', // Center items vertically (in a horizontal layout)
  direction: 'vertical', // Lay out children vertically
  'justify-content': 'center', // Evenly distribute children along the vertical axis
  margin: '10px 20px 10px 20px', // Top and bottom margins of 10px, left and right margins of 20px
};
```

This setup ensures that the children of the `a-container` are vertically arranged, centered both along the main and cross axis, and the container itself has a specified margin from its surroundings.

## Contributing

We welcome contributions to improve and expand our collection of AFrame components! If you're interested in contributing, please follow these steps:

1. **Fork the Repository**: Click on the 'Fork' button at the top right of this page.
2. **Make Your Changes**: Add a new component or improve existing ones.
3. **Submit a Pull Request**: Open a new pull request for your changes and describe what your changes do and why they should be included.

## How to Include Type Definitions from a-frame-components in Your TypeScript Project
### Ensure TypeScript can fully utilize the a-frame-components package's TypeScript type definitions by incorporating them in your compilation configuration. Follow these wholesome configurations to embrace the in-packaged TypeScript types.

1. Get to Know Your tsconfig.json
The tsconfig.json file is the center-stage of any settings inherent to the cycle and reach of TypeScript within your project. It delivers the capstone instructions to TypeScript's compiler.

2. Aim to include The Paths
Modulate your tsconfig.json file by sprucing it up with a direction for "the known" TypeScript sources, specifically focusing on the rich types springing from your a-frame-components NPM package.

Construct the tsconfig.json for Enlightenment
The synthesis of the types from a-frame-components will be perceived if you mark a structured setting like so within your tsconfig.json:

```json
{
  "compilerOptions": {
    //.... 
  },
  "include": [
    "src/**/*",
    "types/**/*",
    "node_modules/a-frame-components/types/**/*"
  ]
}

```

## Components 

- [Gui Menu Container](docs/menu-container.md)
- [Radio Buttons](docs/radio-component.md)
- [Container](docs/container.md)


## License

This project is licensed under the MIT License.

## Acknowledgments

- A special thanks to the AFrame community for providing the foundational VR framework.
- Contributors to this repository.
