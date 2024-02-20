import { getBoundingBoxOfNonTransparentPixels } from '../canvasutil';
import { PAINTER_CONSTANTS } from '../constants';
import { AFRAME } from '../systems/brush';
import { INTERACTABLES } from '../systems/ui';
import { raiseCustomEvent, uuidv4 } from '../util';
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('models-component', {
        schema: {
            ids: { type: 'string' }
        },
        init: function () {
            let ids = this.data.ids.split(';')
            let me = this;
            me.buttonSize = .45;
            ids.map((id, index) => {
                let component = document.createElement('a-model-component');
                component.setAttribute('id', id);
                component.setAttribute('buttonSize', me.buttonSize)
                let entity = document.createElement('a-entity');
                entity.setAttribute('position', `0 ${index * me.buttonSize} 0`)
                entity.appendChild(component);
                me.el.appendChild(entity);
            });
        },
    });

    AFRAME.registerPrimitive('a-models-component', {
        defaultComponents: {
            'models-component': {}
        },
        mappings: {
            //gui item general
            'ids': 'models-component.ids'
        }
    });


    AFRAME.registerComponent('model-component', {
        schema: {
            loraId: {
                type: 'string'
            },
            buttonSize: { type: 'number' },
            position: { type: 'string' }
        },
        init: function () {
            this.buttonSize = this.data.buttonSize || .45;
            let loraContainerEl = this.createLoraContainer({ id: this.data.loraId })
            this.el.setAttribute('position', this.data.position);
            this.el.appendChild(loraContainerEl)
            setTimeout(()=>{
                raiseCustomEvent(PAINTER_CONSTANTS.MODEL_COMPONENT_LOADED, {});
            },1000)
        },
        createLoraContainer: function ({ id }) {
            let me = this;
            let loraContainer = document.createElement('a-entity');
            let imageEntity: any = document.createElement('a-aspect-ratio-image');
            // imageEntity.setAttribute('visible', `false`)
            let imageSize = (me.buttonSize - .02);
            imageEntity.setAttribute('maxwidth', imageSize || `.2`);
            imageEntity.setAttribute('maxheight', imageSize || `.2`);
            document.body.addEventListener(PAINTER_CONSTANTS.MODEL_SELECTED, function (evt: any) {
                const { detail } = evt;
                const { url } = detail;

                // imageEntity.setAttribute('visible', `${!!url}`)
                imageEntity.setAttribute('position', `0 0 .033`)
                imageEntity.setAttribute('url', url || '')
            })
            let loraStyle1 = me.createButton({
                onclick: `testButtonAction`,
                args: `${id}`,
                value: 'Model',
                position: '0 0 .01'
            })
            loraStyle1.addEventListener('click', function () {
                me.el.emit(PAINTER_CONSTANTS.OPEN_MODEL_MENU, {
                    model: id,
                })
            })
            loraStyle1.setAttribute('font-size', '.05')
            loraContainer.appendChild(loraStyle1);
            loraContainer.appendChild(imageEntity);
            return loraContainer;
        },
        createButton: function ({ type, onclick, args, value, position, buttonSize }) {
            let me = this;
            let button = document.createElement(type || 'a-gui-button');

            button.setAttribute('width', buttonSize || me.buttonSize || '0.15')
            button.setAttribute('height', buttonSize || me.buttonSize || '0.15')
            button.setAttribute('onclick', onclick)
            button.setAttribute('args', args)
            button.setAttribute('value', value || ``)
            button.setAttribute('font-color', '#ffffff')
            button.setAttribute('margin', '0 0.02 0.05 0')
            button.setAttribute('position', position || '.4 0 .1')
            return button;
        },
    });
    AFRAME.registerPrimitive('a-model-component', {
        defaultComponents: {
            'model-component': {}
        },
        mappings: {
            //gui item general
            'id': 'model-component.loraId',
            'position': 'model-component.position'
        }
    });
}