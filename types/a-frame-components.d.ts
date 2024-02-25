// aframe.d.ts
// In your a-frame-components.d.ts
declare module 'a-frame-components' {
    // Export all of your package's public methods, elements, and other members like it:
    export async function load(): Promise<void>;
    export function useEventListenerOn(
        evtName: string,
        evtHandler: (event: Event, element: Element) => void,
        initSelector?: string
    ): { [`frame-id`]: string }
    export function useBindEventOn(
        evtName: string,
        attributeName: string,
        getFunction: (event: Event) => any,
        initSelector?: string
    ): { [`frame-id`]: string }
}
declare namespace JSX {
    interface IntrinsicElements {
        'a-base-interactive': {
            on?: string;
            title?: string;
            value?: string;
            active?: boolean;
            width: string | number;
            margin: string;
            height: string | number;
            interactiveType?: string;
            paddingLeft?: number;
            show?: boolean;
            toggle?: boolean;
            toggleState?: boolean;
            checked?: boolean;
            radiosizecoef?: number;
            fontSize?: number;
            fontFamily?: string;
            fontColor?: string;
            borderColor?: string;
            backgroundColor?: string;
            backgroundTextColor?: string;
            hoverColor?: string;
            hoverTextColor?: string;
            activeColor?: string;
            activeTextColor?: string;
            disabledColor?: string;
            disabledTextColor?: string;
            handleColor?: string;
        }
        'a-scene': {
            antialias?: "true" | "false";
            assets?: string;
            background?: string;
            embedded?: "true" | "false";
            fog?: string;
            inspector?: string;
            keyboardShortcuts?: string;
            loadingScreen?: string;
            physics?: string;
            renderer?: string;
            stats?: "true" | "false";
            vrModeUi?: string;

            // Events
            onLoaded?: (event: any) => void;
            onClick?: (event: any) => void;
            onEnterVR?: (event: any) => void;
            onExitVR?: (event: any) => void;
            onRenderStart?: (event: any) => void;

            // Children (for nesting entities or other components)
            children?: React.ReactNode;

            // Add any custom properties or events specific to your project
            [propName: string]: any;
        };
        'a-box': {
            // Geometry properties
            width?: string | number;
            height?: string | number;
            depth?: string | number;
            // Material properties
            color?: string;
            opacity?: string | number;
            // Standard component properties
            position?: string;
            rotation?: string;
            scale?: string;
            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;
            // Custom properties for a-box or A-Frame components can also be included
            [propName: string]: any;

            // Children (for nesting entities or other components)
            children?: React.ReactNode;
        };
        'a-sphere': {
            // Geometry property
            radius?: string | number;
            // Material properties
            color?: string;
            opacity?: string | number;
            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;
            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;
            // Support for custom components or properties
            [propName: string]: any;

            // Optional: Children for including within the sphere, e.g., text or other entities
            children?: React.ReactNode;
        };
        'a-cylinder': {
            // Geometry properties
            radius?: string | number;
            height?: string | number;
            segmentsRadial?: number;
            segmentsHeight?: number;
            openEnded?: "true" | "false";
            thetaStart?: number;
            thetaLength?: number;
            // Material properties
            color?: string;
            opacity?: string | number;
            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;
        };
        'a-plane': {
            // Geometry properties
            width?: string | number;
            height?: string | number;
            // Material properties
            color?: string;
            opacity?: string | number;
            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;
        };
        'a-assets': {
            // Standard A-Frame entity properties applicable to a-assets
            timeout?: string | number;

            // Event listeners specific to asset management
            onLoad?: (event: any) => void;
            onError?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-animation': {// Attributes for a-animation
            attribute?: string;
            from?: string | number;
            to?: string | number;
            dur?: string | number;
            direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
            easing?: string;
            delay?: string | number;
            repeat?: string | number;
            fill?: "forwards" | "backwards" | "both" | "none";
            begin?: string | number;
            end?: string | number;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-text': {            // Text-specific properties
            value?: string;
            color?: string;
            align?: "left" | "center" | "right";
            font?: string;
            width?: string | number;
            wrapCount?: number;
            letterSpacing?: number;
            lineHeight?: string | number;
            opacity?: string | number;
            side?: "front" | "back" | "double";
            whiteSpace?: "normal" | "pre" | "nowrap";

            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-camera': {  // Camera-specific properties
            fov?: string | number; // Field of view
            near?: string | number; // Near clipping plane
            far?: string | number; // Far clipping plane
            active?: "true" | "false"; // If the camera is the active camera
            lookControlsEnabled?: "true" | "false"; // If look controls are enabled
            wasdControlsEnabled?: "true" | "false"; // If WASD controls are enabled

            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-troika-text': {
            // Text-specific properties
            align?: 'left' | 'right' | 'center' | 'justify';
            anchor?: 'left' | 'right' | 'center' | 'align';
            baseline?: 'top' | 'center' | 'bottom';
            clipRect?: string;
            color?: string;
            colorRanges?: string;
            curveRadius?: number;
            depthOffset?: number;
            direction?: 'auto' | 'ltr' | 'rtl';
            fillOpacity?: number;
            font?: string;
            fontSize?: number;
            letterSpacing?: number;
            lineHeight?: number;
            maxWidth?: number;
            outlineBlur?: number | string;
            outlineColor?: string;
            outlineOffsetX?: number | string;
            outlineOffsetY?: number | string;
            outlineOpacity?: number;
            outlineWidth?: number | string;
            overflowWrap?: 'normal' | 'break-word';
            strokeColor?: string;
            strokeOpacity?: number;
            strokeWidth?: number | string;
            textIndent?: number;
            value?: string;
            whiteSpace?: 'normal' | 'nowrap';

            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-cursor': {
            // Cursor-specific properties
            color?: string;
            fuse?: boolean | "true" | "false";
            fuseTimeout?: string | number;
            raycaster?: string; // A-Frame raycaster properties as a string
            // Example: "objects: .clickable; recursive: true"

            // Material properties (if you're using a custom cursor material)
            opacity?: string | number;
            transparent?: boolean | "true" | "false";

            // Geometry properties (if you're customizing the cursor's geometry)
            radiusInner?: string | number;
            radiusOuter?: string | number;
            segmentsTheta?: number;

            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Common A-Frame entity events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;

            // Support for custom components or properties
        };
        'a-light': {
            // Generic Light Component Properties
            type?: 'ambient' | 'directional' | 'hemisphere' | 'point' | 'spot';
            color?: string;
            intensity?: number | string;

            // Spot and Directional Light Exclusive
            angle?: number;
            penumbra?: number; // Spot light only
            decay?: number; // Point/Spot light only
            distance?: number;
            target?: string; // Directional/Spot light only, expects a selector to a target entity

            // Hemisphere Light Exclusive
            groundColor?: string;
            skyColor?: string; // alias for 'color' in hemisphere lights

            // Point and Spot Light
            castShadow?: boolean | "true" | "false";

            // Common Shadow Parameters
            shadowCameraNear?: number;
            shadowCameraFar?: number;
            shadowCameraFov?: number;
            shadowCameraVisible?: boolean | "true" | "false";
            shadowBias?: number;
            shadowRadius?: number;
            shadowMapWidth?: number;
            shadowMapHeight?: number;

            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Light events
            onClick?: (event: any) => void;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-canvas-image': {
            // Add React-specific property 'key' for list rendering and TypeScript intrinsic properties
            key?: string | number;

            // Elements from the canvas-image schema
            url?: string;
            height?: number;

            // All the geometry and other properties should have the 'any' type for fallback.
            [property: string]: any;
        }
        'a-asset-item': {
            // Required properties for a-asset-item
            id?: string;
            src?: string;
            // Optional properties
            responseType?: string; // Used to define the type of response (e.g., "arraybuffer" for binary files)
            crossorigin?: "anonymous" | "use-credentials"; // Handling cross-origin requests

            // Standard A-Frame entity properties, if any apply
            position?: string;
            rotation?: string;
            scale?: string;

            // Common A-Frame entity events, if applicable
            onLoad?: (event: any) => void;
            onError?: (event: any) => void;

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-entity': {
            // Support for all HTMLGlobalAttributes and A-Frame's core component properties
            position?: string | { x: number; y: number; z: number; };
            rotation?: string | { x: number; y: number; z: number; };
            scale?: string | { x: number; y: number; z: number; };
            visible?: boolean | "true" | "false";
            geometry?: string | { primitive: string;[key: string]: any; }; // geometry="primitive: box"
            material?: string | { color: string; opacity?: number; transparent?: boolean;[key: string]: any; };
            light?: string | { type: string;[key: string]: any; }; // Generic for extensibility
            animation?: string; // For handling A-Frame's built-in animation component
            // Add any known A-Frame or custom component as a new property here
            [component: string]: any;

            // 3D model support
            'gltf-model'?: string;
            'obj-model'?: string;
        };
        'a-sky': {
            // Standard A-Frame entity properties
            position?: string;
            rotation?: string;
            scale?: string;

            // Material properties
            color?: string; // Color of the sky
            src?: string; // URL of the image or video texture
            opacity?: number; // Opacity of the sky

            // Geometry properties (for setting custom geometry on the sky, though typically not needed)
            radius?: number; // Radius of the sky sphere

            // Shader properties (if using a custom shader)
            shader?: string; // The type of shader to use

            // Event handlers
            onLoad?: (event: any) => void; // Event fired when the texture is loaded
            onError?: (event: any) => void; // Event fired if there is an error loading the texture

            // Support for custom components or properties
            [propName: string]: any;
        };
        'a-skeleton-body': {
            position?: string;
            rotation?: string;
            scale?: string;
            [propName: string]: any;
        };
        'a-rounded': {
            // Define the props matching the schema of your 'rounded' component
            enabled?: boolean;
            width?: number | string;
            height?: number | string;
            radius?: number | string;
            topLeftRadius?: number | string;
            topRightRadius?: number | string;
            bottomLeftRadius?: number | string;
            bottomRightRadius?: number | string;
            depthWrite?: boolean;
            polygonOffset?: boolean;
            polygonOffsetFactor?: number | string;
            color?: string;
            opacity?: number | string;

            // To match the pattern of your custom animation attributes:
            targetColor?: string;
            colorAnimationDuration?: number | string;
            // Allow any other property with [propName: string]: any;
            // This is useful for custom data-attributes or any properties not explicitly defined in the typings
            [propName: string]: any;
        };
        'a-radio': {
            options?: string; // Since data is passed as a string (potentially a JSON-encoded string)
            value?: string;
            [propName: string]: any;
        };
        'a-gui-cursor': {
            // React-specific props (e.g., key, ref) and common HTML attributes can be included if necessary
            key?: string | number;
            // Mapping the props to the primitive attributes
            fuse?: boolean;
            'fuse-timeout'?: string | number;
            color?: string;
            'hover-color'?: string;
            'active-color'?: string;
            distance?: string | number;
            design?: string;
            [propName: string]: any;
        };
        'a-menu-container': {
            // Direct mappings from A-Frame to JSX props
            width?: string;
            value?: string;
            height?: string;
            margin?: string;
            'text-value'?: string;
            selected?: string;
            open?: string | boolean;
            'flex-direction'?: string;
            'justify-content'?: string;
            dur?: string;
            easing?: string;
            'align-items'?: string;
            'item-padding'?: string | number;
            'menu-item-width'?: string | number;
            'menu-item-height'?: string | number;
            'forward-step'?: string | number;
            'menu-item-margin'?: string;
            'menu-direction'?: string;
            opacity?: string | number;
            'is-top-container'?: string | boolean;
            'panel-color'?: string;
            'panel-rounded'?: string | number;
            'font-family'?: string;
            'font-color'?: string;
            'border-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'active-color'?: string;
            'handle-color'?: string;
            [propName: string]: any;
        };
        'a-gui-transformer': {
            [propName: string]: any;
        };
        'a-gui-flex-container': {
            // General HTML attributes like id, className, style, etc., can also be included here
            id?: string;
            className?: string;
            // Direct mappings from A-Frame HTML attributes to JSX props
            width?: string | number;
            height?: string | number;
            margin?: string;
            'flex-direction'?: string;
            'justify-content'?: string;
            'align-items'?: string;
            'item-padding'?: string;
            opacity?: string | number;
            'is-top-container'?: string | boolean;
            'panel-color'?: string;
            'panel-rounded'?: string | number;
            'font-family'?: string;
            'font-color'?: string;
            'border-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'active-color'?: string;
            'handle-color'?: string;
            // Allow any other arbitrary properties
            [propName: string]: any;
        };
        'a-gui-button': {
            // Mappings for gui-interactable
            'onclick'?: string;
            'clickArgs'?: string;
            'onhover'?: string;
            'key-code'?: string;

            // Mappings for gui-item common properties
            'color-change-animation'?: string;
            'width'?: string;
            'height'?: string;
            'depth'?: string;
            'base-depth'?: string;
            'gap'?: string;
            'radius'?: string;
            'margin'?: string;

            // Mappings for gui-item bevelbox
            'bevel'?: string;
            'bevel-segments'?: string;
            'steps'?: string;
            'bevel-size'?: string;
            'bevel-offset'?: string;
            'bevel-thickness'?: string;

            //gui button specific
            'on'?: string;
            'grabbanddroppable'?: string;
            'value'?: string;
            'font-size'?: string;
            'text-position'?: string;
            'enable-button-container'?: string;
            'font-family'?: string;
            'font-color'?: string;
            'border-color'?: string;
            'focus-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'active-color'?: string;
            'toggle'?: string;
            'toggle-state'?: string;
            // Accept additional arbitrary properties to ensure flexibility
            [propName: string]: any;
        };
        'a-infinite-list': {
            // a-infinite-list specific properties as given in the mappings
            itemtemplate?: string;
            selectionevent?: string;
            closeevent?: string;
            sourceId?: string;
            options?: string;
            width?: string | number;
            height?: string | number;
            margin?: string | number;
            columns?: string | number;
            itemsize?: string | number;
            selected?: string;
            hideclose?: string | boolean;
            'icon-font'?: string,
            'icon-font-size'?: string,
            'icon'?: string,
            speed?: string | number,
            // Allow any other property
            [propName: string]: any;
        };
        'a-aspect-ratio-image': {
            // Directly reflecting A-Frame attribute mapping for aspect-ratio-image
            url?: string;
            maxwidth?: string | number;
            maxheight?: string | number;

            // Allows for A-Frame's custom events and any other DOM event listeners
            onClick?: (event: any) => void; // Example event listener
            onMouseEnter?: (event: any) => void; // Extend as needed

            // General HTML attributes like className, id, etc. can also be included here
            className?: string;
            id?: string;

            // Catch-all type definition for additional A-Frame components' attributes
            // or any unspecified custom attributes.
            [propName: string]: any;
        };
        'a-gui-icon-label-button': {

            // Mappings for gui-interactable
            'onclick'?: string;
            'onhover'?: string;
            'key-code'?: string;

            // Mappings for gui-item common properties
            'width'?: string | number;
            'height'?: string | number;
            'margin'?: string;

            // Mappings for gui-icon-label-button specific
            'on'?: string;
            'font-color'?: string;
            'font-family'?: string;
            'font-size'?: string | number;
            'border-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'active-color'?: string;
            'icon'?: string;
            'icon-active'?: string;
            'icon-font'?: string;
            'icon-font-size'?: string | number;
            'value'?: string;
            'toggle'?: string | boolean;
            'toggle-state'?: string | boolean;

            // Catch-all type definition for additional A-Frame components' attributes
            // or any unspecified custom attributes
            [propName: string]: any;
        };
        'a-gui-toggle': {
            // Mappings for gui-interactable
            'onclick'?: string;
            'onhover'?: string;
            'key-code'?: string;

            // Mappings for gui-item common properties
            'width'?: string | number;
            'height'?: string | number;
            'margin'?: string;

            // Mappings for gui-toggle specific
            'on'?: string;
            'active'?: string | boolean;
            'checked'?: string | boolean;
            'value'?: string;
            'font-color'?: string;
            'font-family'?: string;
            'font-size'?: string | number;
            'border-width'?: string | number;
            'border-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'active-color'?: string;
            'handle-color'?: string;

            // A catch-all for additional properties not explicitly defined above
            [propName: string]: any;
        };
        'a-slider': {
            // Mappings for gui-slider specific properties
            'active-color'?: string;
            'background-color'?: string;
            'targetbarsize'?: string | number;
            'title-text-font'?: string;
            'percentage-text-font'?: string;
            'border-color'?: string;
            'handle-color'?: string;
            'orientation'?: 'horizontal' | 'vertical';
            'handle-inner-depth'?: string | number;
            'handle-inner-radius'?: string | number;
            'handle-outer-depth'?: string | number;
            'handle-outer-radius'?: string | number;
            'title-position'?: string;
            'title-scale'?: string | number;
            'hover-color'?: string;
            'left-right-padding'?: string | number;
            'title'?: string;
            'margin'?: string;
            'percent'?: string | number;
            'slider-bar-depth'?: string | number;
            'slider-bar-height'?: string | number;
            'top-bottom-padding'?: string | number;
            'bar-length': string | number;
            'bar-thickness': string | number;
            // Catch-all property for any additional unspecified custom attributes
            [propName: string]: any;
        };
        'a-gui-input': {

            // Mappings for gui-interactable
            'onclick'?: string;
            'onhover'?: string;

            // Mappings for gui-item general properties
            'width'?: string | number;
            'height'?: string | number;
            'margin'?: string;

            // Mappings for gui-input specific properties
            'value'?: string;
            'font-size'?: string | number;
            'font-family'?: string;
            'font-color'?: string;
            'background-color'?: string;
            'hover-color'?: string;
            'border-color'?: string;
            'border-hover-color'?: string;

            // A catch-all property for any additional, unspecified custom attributes
            [propName: string]: any;
        };
        'a-gui-label': {
            // Mappings for gui-item general properties
            'width'?: string | number;
            'height'?: string | number;
            'margin'?: string;

            // Mappings for gui-label specific properties
            'align'?: string;
            'anchor'?: string;
            'value'?: string;
            'font-size'?: string | number;
            'line-height'?: string | number;
            'letter-spacing'?: string | number;
            'font-color'?: string;
            'font-family'?: string;
            'background-color'?: string;
            'opacity'?: string | number;
            'text-depth'?: string | number;
            // A catch-all for additional or future-proofing attributes
            [propName: string]: any;
        };
        'a-gui-progressbar': {
            // Mappings for the default components' common options
            'width'?: string | number;
            'height'?: string | number;
            'margin'?: string;

            //gui-progressbar specific attributes
            'background-color'?: string;
            'active-color'?: string;

            // Catch-all for additional data-* attributes or others not explicitly declared above
            [propertyName: string]: any;
        };
        'a-container': {
            alignment?: 'flexStart' | 'flexEnd' | 'center', // flexStart, flexEnd, center
            direction?: 'horizontal' | 'vertical', // vertical, horizontal
            'justify-content'?: 'flexStart' | 'flexEnd' | 'center',
            margin?: string,// top right bottom left
            [propertyName: string]: any;
        };
    }
}
