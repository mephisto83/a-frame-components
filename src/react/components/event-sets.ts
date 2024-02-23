import { AFRAME } from '../systems/brush';
import { uuidv4 } from '../util';
const THREE: any = (window as any).THREE;
export default function () {
    AFRAME.registerComponent('event-set', {
        multiple: true, // Enable multiple instances

        schema: {
            event: { type: 'string' },
            target: { type: 'selector' },
            attribute: { type: 'string' },
            component: { type: 'string' },
            value: { type: 'string' },
            function_name: { type: 'string', default: '' }, // Function name
            function_args: { type: 'string', default: '' } // Function arguments as JSON string
        },
        init: function () {
            var data = this.data;
            var targetEl = data.target || this.el;

            console.log(`'Init event: ${data.event} => ' ${data.attribute} `)
            this.eventHandler = (evt) => {
                try {
                    let args = [];
                    if (data.function_args) {
                        try {
                            args = JSON.parse(data.function_args);
                        } catch (e) {
                            console.log('failed to parse args')
                        }
                    };
                    // Check if function_name is provided and exists on the target element
                    if (data.function_name) {
                        // Check if function_name is provided and exists on the target element
                        if (typeof targetEl[data.function_name] === 'function') {
                            // Call the function on the target element with the parsed arguments
                            targetEl[data.function_name](evt, args);
                        } else if (data.component) {
                            // Handle function call within the attribute object
                            let componentObject = targetEl.components[(data.component)];
                            if (componentObject && typeof componentObject[data.function_name] === 'function') {
                                if (data.component == 'interactions') {
                                    args.push({
                                        raycaster: this.el.components.raycaster
                                    })
                                }
                                componentObject[data.function_name](evt, args);
                            }
                            else {
                                componentObject[data.function_name](evt, args);
                            }
                        }
                    } else {
                        let attributeSplit = data.attribute.split('.');
                        if (attributeSplit.length === 2) {
                            // Handle nested component properties like 'material.color'
                            let componentProps = targetEl.getAttribute(attributeSplit[0]);
                            if (componentProps) {
                                componentProps[attributeSplit[1]] = data.value;
                                targetEl.setAttribute(attributeSplit[0], componentProps);
                            }
                        } else {
                            // Handle direct attributes
                            targetEl.setAttribute(data.attribute, data.value);
                        }
                    }
                } catch (e) {
                    console.error('Failed to set attribute:', e);
                }
            };

            this.el.addEventListener(data.event, this.eventHandler);
        },

        remove: function () {
            this.el.removeEventListener(this.data.event, this.eventHandler);
        }
    });
}