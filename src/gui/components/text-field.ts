import { AFRAME } from "../../react/root";

export default function () {
    AFRAME.registerComponent('text-field', {
        schema: {
            value: { type: 'string', default: '' } // ID of the element to display the text
        },

        init: function () {
            let me = this;
            // Create the hidden input field
            let baseInteractive = document.createElement('a-base-interactive');
            me.baseInteractive = baseInteractive;
            me.el.appendChild(baseInteractive);
            me.input = document.createElement('input');
            me.input.setAttribute('type', 'text');
            me.input.style.position = 'fixed ';
            me.input.style.left = '-9999px'; // Place it outside of the viewport

            document.body.appendChild(me.input);

            // Handle clicks on this entity to focus the hidden input
            me.el.addEventListener('click', () => {
                me.input.focus();
            });

            // Synchronize text input with the target entity
            me.input.addEventListener('change', (evt) => {
                if (baseInteractive) {
                    // For text entity in A-Frame, use 'text' component's 'value' property
                    baseInteractive.setAttribute('title', me.input.value);
                    me.el.emit('change', { value: me.input.value });
                }
            });
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
        }
    });
}