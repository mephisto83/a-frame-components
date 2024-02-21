import { AFRAME } from "../../painter/root";
import { createContainer, createInteractiveButton } from "../../util";
export default function () {
    AFRAME.registerComponent('radio-component', {
        schema: {
            options: { type: 'string', default: '' },
            value: { type: 'string', default: '' }
        },
        init: function () {
            let me = this;
            me.radioContainer = null;
            this.render()
        },
        update: function (oldData) {
            let me = this;
            if (oldData.options !== this.data.options) {
                this.render();
            }
            if (!oldData.value || oldData.value !== this.data.value) {
                me.updateChecked();
            }
        },
        updateChecked: function () {
            let me = this;
            if (me.optionValues) {
                Object.keys(me.optionValues).map((key) => {
                    if (me.optionValues[key]) {
                        me.optionValues[key].setAttribute('checked', me.data.value === key);
                    }
                })
            }
        },
        render: function () {
            let me = this;
            if (me.radioContainer) {
                me.radioContainer.parentNode.removeChild(me.radioContainer);
            }
            if (this.data.options) {
                me.optionValues = {};
                me.options = JSON.parse(this.data.options);
                let buttonContainer = createContainer('a-entity', {
                    radius: .1,
                    color: "#000",
                    opacity: .7
                }, { left: 0.05, right: .05, top: .1, bottom: .1 })

                me.options.map((option: RadioOption) => {
                    let button = createInteractiveButton({
                        width: .3,
                        ...option,
                        interactiveType: 'radio',
                        onRender: (el) => {
                            el.addEventListener('click', (evt) => {
                                if (me.data.value !== option.value) {
                                    me.el.emit('change', {
                                        value: option.value
                                    });
                                }
                                me.data.value = option.value;

                                me.el.emit('click', {
                                    value: option.value
                                });
                                evt.preventDefault();
                            })
                            me.optionValues = {
                                ...me.optionValues,
                                [option.value]: el
                            }
                        }
                    })
                    buttonContainer.appendChild(button);
                })
                let { element } = buttonContainer.render();
                me.radioContainer = element.element();
                me.el.appendChild(me.radioContainer);
                me.updateChecked();
            }
        }
    });

    AFRAME.registerPrimitive('a-radio-component', {
        defaultComponents: {
            'radio-component': {}
        },
        mappings: {
            'options': 'radio-component.options',
            'value': 'radio-component.value',
        }
    });
}

export interface RadioOption {
    text: string;
    value: string;
    id: string;
}