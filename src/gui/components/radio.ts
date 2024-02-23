import { AFRAME } from "../../react/root";
import { createContainer, createElement, createInteractiveButton } from "../../util";
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
            me.optionValues = {};
            me.options = JSON.parse(this.data.options);
            if (this.data.options) {
                if (false) {
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
                                        me?.el?.setAttribute('value', option.value)
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
                else {
                    if (this.data.options) {
                        let buttonContainer = document.createElement('a-container');
                        buttonContainer.setAttribute('direction', 'horizontal')
                        buttonContainer.setAttribute('alignment', 'center')
                        buttonContainer.setAttribute('margin', '.1 .1 .1 .1')
                        me.options.map((option: RadioOption) => {
                            let button = createElement("a-base-interactive",
                                {
                                    width: (option as any).width || .3,
                                    height: me.data.optionHeight || .2,
                                    margin: '0 0 0 0',
                                    value: option.text || option.value,
                                    interactiveType: 'radio',
                                    ['font-size']: .07
                                }
                                //`width="1" interactive-type="button" height="0.2" value="${text}" margin="0 0 0.05 0" font-size=".07"`
                            )();
                            button.addEventListener('click', (evt) => {
                                if (me.data.value !== option.value) {
                                    me?.el?.setAttribute('value', option.value)
                                    me.el.emit('change', {
                                        value: option.value
                                    });
                                }
                                me.data.value = option.value;

                                me.el.emit('click', {
                                    value: option.value
                                });
                                evt.preventDefault();
                            });
                            me.optionValues = {
                                ...me.optionValues,
                                [option.value]: button
                            }
                            buttonContainer.appendChild(button);
                        })
                        me.radioContainer = buttonContainer;
                        me.el.appendChild(me.radioContainer);
                        me.updateChecked();
                    }
                }
            }
        }
    });

    AFRAME.registerPrimitive('a-radio', {
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