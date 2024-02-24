# AFrame Components Repository

Welcome to the AFrame Components Repository! This collection of custom components is designed to enhance your AFrame-based virtual reality (VR) projects by providing additional functionality, effects, and integrations that are easy to use and integrate.

## Introduction

This repository offers a variety of AFrame components that you can use to create immersive and interactive 3D scenes in the browser. Whether you're building simple VR experiences or complex interactive applications, our components are designed to be flexible, modular, and customizable.

## Features

- Radio
- Container
- Menu
- Button
- Base-interactive
- Slider

## Installation

To use the components from this repository in your AFrame project, follow these steps:

1. **Include AFrame**: Ensure AFrame is included in your HTML file:

```html
  <head>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  </head>
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

## Events
  
Manage event listeners with the 'userEventListenerOn' hook. Pass the event ,  a handler, and a css selector for the component.

[useEventListenerOn](docs/use-event-listener-on.md)
[useBindEventOn](docs/use-event-listener-on.md);

```
import { useEventListenerOn } from 'a-frame-components';
    
export default function SpaceShipScene() {
    useEventListenerOn('click', () => console.log('Element clicked'), '#menu');
    let guiProps = useBindEventOn('change', 'title', (evt)=>event.detail.value)
    return (
      <>
        <a-scene>
           <a-gui-button value="a b asdfutton" {...guiProps} />
          <a-menu-container id="menu">
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
        </a-scene>
      </>
    )
}
```

## How to Include Type Definitions from a-frame-components in Your TypeScript Project
### Ensure TypeScript can fully utilize the a-frame-components package's TypeScript type definitions by incorporating them in your compilation configuration.

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
- [Button](docs/gui-button.md)
- [Base Interactive](docs/base-interactive.md)
- [Slider](docs/slider.md)


## License

This project is licensed under the MIT License.

## Acknowledgments

- A special thanks to the AFrame community for providing the foundational VR framework.
- Contributors to this repository.
