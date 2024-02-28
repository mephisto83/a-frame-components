import { AFRAME } from "../../react/root";
import { createElement } from "../../util";
import mixin from "./mixin";
export default function () {
    AFRAME.registerComponent('checkbox-component', {
        schema: {
            value: { type: 'boolean', default: false },
            label: { type: 'string', default: false },
        },
        init: function () {
            this.render()
        },
        update: function (oldData) {
            let me = this;
            if (me.button) {
                me.button.setAttribute('value', this.data.label);
                me.button.setAttribute('checked', !!this.data.value);
            }
        },
        render: function () {
            let me = this;
            let button = createElement("a-base-interactive",
                {
                    width: .3,
                    height: .2,
                    margin: '0 0 0 0',
                    value: this.data.label,
                    interactiveType: 'checkbox',
                    ['font-size']: .07
                }
            )();
            button.setAttribute('resize-on-text', true);
            button.addEventListener('click', (evt) => {
                me?.el?.setAttribute('value', !me.data.value)
                me.el.emit('change', {
                    value: !me.data.value
                });
                me.el.emit('click', {
                    value: !me.data.value
                });
                evt.preventDefault();
            });
            me.button = button;
            me.el.appendChild(me.button);
            me.updateElementSize(me, me.el);
        },
        ...mixin,
        getWidth: function () {
            let me = this;
            return parseFloat(`${me.button.getWidth()}`);
        },
        getHeight: function () {
            let me = this;
            return parseFloat(`${me.button.getHeight()}`);
        },
    });

    AFRAME.registerPrimitive('a-checkbox', {
        defaultComponents: {
            'checkbox-component': {},
        },
        mappings: {
            'label': 'checkbox-component.label',
            'value': 'checkbox-component.value',
        }
    });
}