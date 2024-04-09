import { AFRAME } from "../../react/root";
import { raiseCustomEvent } from "../../react/util";
import { createContainer, createElement, createInteractiveButton } from "../../util";
import mixin from "./mixin";
export default function () {
    AFRAME.registerComponent('radiocomponent', {
        schema: {
            options: { type: 'string', default: '' },
            value: { type: 'string', default: '' },
            paddingRight: { type: 'number', default: .05 },
            direction: { type: 'string', default: '' }
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

                if (this.data.options) {
                    let buttonContainer = document.createElement('frame-container');
                    buttonContainer.setAttribute('direction', this.data.direction || 'horizontal')
                    buttonContainer.setAttribute('alignment', 'flexStart')
                    buttonContainer.setAttribute('margin', '0 0 0 0')
                    me.options.map((option: RadioOption) => {
                        let button = createElement("frame-base-interactive",
                            {
                                width: (option as any).width || .3,
                                height: me.data.optionHeight || .2,
                                margin: '0 0 0 0',
                                value: option.text || option.value,
                                [`interactive-type`]: option.type || 'radio',
                                ['font-size']: .07
                            }
                            //`width="1" interactive-type="button" height="0.2" value="${text}" margin="0 0 0.05 0" font-size=".07"`
                        )();
                        button.setAttribute('resize-on-text', true);
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
                    me.radioContainer.addEventListener('size-update', (evt) => {
                        me.updateElementSize(me.radioContainer, me.el);
                    })
                    me.el.appendChild(me.radioContainer);
                    me.updateChecked();
                    me.updateElementSize(me.radioContainer, me.el);
                }
            }
        },
        ...mixin,
        getWidth: function () {
            let me = this;
            return parseFloat(`${me.radioContainer.getWidth()}`);
        },
        getHeight: function () {
            let me = this;
            return parseFloat(`${me.radioContainer.getHeight()}`);
        },
    });

    AFRAME.registerPrimitive('frame-radio', {
        defaultComponents: {
            'radiocomponent': {},
        },
        mappings: {
            'options': 'radiocomponent.options',
            'value': 'radiocomponent.value',
            direction: 'radiocomponent.direction',
        }
    });
}

export interface RadioOption {
    text: string;
    value: string;
    id: string;
    type?: string;
}