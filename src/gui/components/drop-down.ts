
import mixin from './mixin';

export default function () {
    const AFRAME: any = (window as any).AFRAME || {}
    if (typeof AFRAME === 'undefined') {
        throw new Error('Component attempted to register before AFRAME was available.');
    }


    AFRAME.registerComponent('drop-down', {
        schema: {
            value: { type: 'string', default: '' },
            options: { type: 'string', default: '' },
        },

        init: function () {
            var el = this.el;
            var data = this.data;
            this.render();
        },
        ...mixin,
        getWidth: function () {
            return parseFloat(`${this?.container?.getAttribute('menu-item-width') || 0}`);
        },
        getHeight: function () {
            return parseFloat(`${this?.container?.getAttribute('menu-item-height') || 0}`);
        },
        render: function () {
            let el = this.el;
            let me = this;
            try {
                let options = JSON.parse(this.data.options);
                if (options?.length) {
                    if (me.container) {
                        me.container.parentNode.removeChild(me.container);
                    }
                    const container = document.createElement('frame-menu-container');
                    container.setAttribute('forward-step', '0.05');
                    container.setAttribute('text-value', this.data.value || '-- - Select-- - ');
                    container.setAttribute('menu-direction', 'down');
                    container.setAttribute('flex-direction', 'column');
                    container.setAttribute('justify-content', 'flex-start');
                    container.setAttribute('align-items', 'flex-start')
                    container.setAttribute('padding', '0.01')
                    container.setAttribute('menu-item-height', `.2`)
                    container.setAttribute('menu-item-width', `1.0`);
                    this.container = container;

                    options.forEach((font) => {
                        const menuItem = document.createElement('frame-base-interactive'); // Assuming 'frame-base-interactive' is a custom component or styled div
                        menuItem.setAttribute('font-size', '.07');
                        menuItem.setAttribute('value', font.value);
                        menuItem.setAttribute('title', font.name);
                        menuItem.setAttribute('interactive-type', 'button');
                        menuItem.setAttribute('width', '1');
                        menuItem.setAttribute('height', '.2');
                        menuItem.setAttribute('margin', '0 0 0.05 0');
                        container.appendChild(menuItem);
                    })
                    el.appendChild(container);

                    me.updateElementSize(me, me.el);
                }
            } catch (e) {
                console.error(e);
            }
        },

        /**
         * Called when component is attached and when component data changes.
         * Generally modifies the entity based on the data.
         */
        update: function (oldData) {
            if (oldData.options !== this.data.options) {
                this.render();
            }
            if (this.data.value !== oldData.value) {
                this.container.setAttribute('text-value', this.data.value || '-- - Select-- - ');
            }
        },

        remove: function () { },

        pause: function () { },

        play: function () { }
    });

    AFRAME.registerPrimitive('frame-drop-down', {
        defaultComponents: {
            'drop-down': {}
        },
        mappings: {
            //gui item general
            'options': 'drop-down.options',
            'value': 'drop-down.value'
        }
    });
}