# AFrame Components Repository

Welcome to the AFrame Components Repository! This collection of custom components is designed to enhance your AFrame-based virtual reality (VR) projects by providing additional functionality, effects, and integrations that are easy to use and integrate.

## Introduction

This repository offers a variety of AFrame components that you can use to create immersive and interactive 3D scenes in the browser. Whether you're building simple VR experiences or complex interactive applications, our components are designed to be flexible, modular, and customizable.

## Features

- **Component 1**: Description of what it does and its benefits.
- **Component 2**: Description of what it does and its benefits.
- **Component 3**: Description of what it does and its benefits.
- (Add more components as needed.)

## Installation

To use the components from this repository in your AFrame project, follow these steps:

1. **Include AFrame**: Ensure AFrame is included in your HTML file:

    ```html
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
    ```

2. **Add Component Scripts**: Include the desired component scripts in your HTML file after including AFrame. You can link directly to the files in this repository (though we recommend downloading or bundling them for production use):

    ```html
    <script src="path/to/component1.js"></script>
    <script src="path/to/component2.js"></script>
    ```

## Usage

After installing the components, you can use them in your AFrame scenes by adding them to your entities. Here are some examples:

```html
<a-entity component1="property: value;"></a-entity>
<a-entity component2="property: value;"></a-entity>
```

```html
<!-- Basic usage of Component 1 -->
<a-scene>
  <a-entity component1></a-entity>
</a-scene>
```
## API Documentation

For each component, you'll find detailed API documentation below:

### Component 1
- **Property**: Description and usage.
- **Example**: How to use this property.

### Component 2
- **Property**: Description and usage.
- **Example**: How to use this property.

(Repeat for each component.)

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


## License

This project is licensed under the MIT License.

## Acknowledgments

- A special thanks to the AFrame community for providing the foundational VR framework.
- Contributors to this repository.
