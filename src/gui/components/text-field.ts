import { AFRAME } from "../../react/root";
import mixin from "./mixin";

export default function () {
    AFRAME.registerComponent('text-field', {
        schema: {
            value: { type: 'string', default: '' }, // ID of the element to display the text
            fontSize: { type: 'number', default: 0 },
            width: { type: 'number', default: 1 },
            height: { type: 'number', default: .2 },
        },
        ...mixin,
        getWidth: function () {
            return parseFloat(`${this.width}`);
        },
        getHeight: function () {
            return parseFloat(`${this.height}`);
        },
        update: function (oldData: any) {
            let me = this;
            let update = false;
            if (oldData?.fontSize !== this.data.fontSize) {
                me.baseInteractive.setAttribute('font-size', this.data.fontSize);
            }
            if (oldData?.width !== this.data.width) {
                me.baseInteractive.setAttribute('width', this.data.width);
                update = true;
            }
            if (oldData?.height !== this.data.height) {
                me.baseInteractive.setAttribute('height', this.data.height);
                update = true;
            }
        },
        init: function () {
            let me = this;
            // Create the hidden input field
            let minimumHeight = this.data.height;
            this.paddingLeft = .01;
            let baseInteractive = document.createElement('a-base-interactive');
            me.baseInteractive = baseInteractive;
            me.baseInteractive.setAttribute('padding-left', this.paddingLeft)
            me.baseInteractive.setAttribute('interactive-type', 'text');
            me.baseInteractive.setAttribute('beingEdited', 'true');
            me.el.appendChild(baseInteractive);
            me.input = document.createElement('input');
            me.input.setAttribute('type', 'text');
            me.input.style.position = 'fixed ';
            me.input.style.left = '-9999px'; // Place it outside of the viewport
            me.width = me.data.width;
            me.height = me.data.height;
            baseInteractive.addEventListener('text-size-change', (evt: any) => {
                console.log(evt);
                let { detail } = evt;
                if (detail) {
                    let { value } = detail;
                    if (value) {
                        let { max, min } = value;
                        if (max && min) {
                            me.updateElementSize(me, me.el);
                            if (false) {
                                me.el.setAttribute('width', Math.abs(max.x - min.x));
                            }
                            me.height = Math.max(Math.abs(max.y - min.y), minimumHeight);
                            me.updateElementSize(me, me.el);
                        }
                    }
                }
            })
            document.body.appendChild(me.input);

            // Handle clicks on this entity to focus the hidden input
            me.el.addEventListener('click', () => {
                me.input.focus();
            });

            // Synchronize text input with the target entity
            me.input.addEventListener('input', (evt) => {
                if (baseInteractive) {
                    // For text entity in A-Frame, use 'text' component's 'value' property
                    baseInteractive.setAttribute('value', me.input.value);
                    me.el.emit('change', { value: me.input.value });
                }
            });
            // Function to log the cursor position
            const logCursorPosition = () => {
                // Assuming inputElement is an HTMLInputElement
                console.log(me.input.selectionStart);
                me.baseInteractive.setAttribute('cursor-position', me.input.selectionStart);
            };

            // Listen for keydown and keyup events
            me.input.addEventListener('keydown', logCursorPosition);
            me.input.addEventListener('keyup', logCursorPosition);

            // Listen for mouse clicks
            me.input.addEventListener('click', logCursorPosition);

            // Listen for input events (covers cut, paste, autocomplete, etc.)
            me.input.addEventListener('input', logCursorPosition);

            // Listen for drag and drop
            me.input.addEventListener('dragend', logCursorPosition);
            me.updateElementSize(me, me.el);
        },
        remove: function () {
            let me = this;
            // Clean up the input field when the component is removed
            if (me.input && me.input.parentNode) {
                me.input.parentNode.removeChild(me.input);
            }
        }
    });

    AFRAME.registerPrimitive('a-text-input', {
        defaultComponents: {
            'text-field': {},
        },
        mappings: {
            'value': 'text-field.value',
            'font-size': 'text-field.fontSize',
            'width': 'text-field.width',
            'height': 'text-field.height',
        }
    });
    function getCursorPosition(inputElement: HTMLInputElement): number | null {
        // Check if the selectionStart property is supported
        if (typeof inputElement.selectionStart === "number") {
            return inputElement.selectionStart;
        } else {
            console.error("The browser does not support selectionStart");
            return null; // Return null if selectionStart is not supported
        }
    }
}
