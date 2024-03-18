import { AFRAME } from "../root";
import { GetColor } from "../systems/ui";
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('dnd-ghost', {
        schema: {
            options: { type: 'string' }
        },
        init: function () {
            let imageCube: any = document.createElement('a-box');
            imageCube.setAttribute('width', .2)
            imageCube.setAttribute('height', .2)
            imageCube.setAttribute('depth', .2)
            imageCube.setAttribute('color', 'blue');
            this.el.appendChild(imageCube);
        }
    });
    AFRAME.registerPrimitive('frame-dnd-ghost', {
        defaultComponents: {
            'dnd-ghost': {}
        },
        mappings: {
            options: 'dnd-ghost.options'
        }
    })
    AFRAME.registerComponent('dnd-image', {
        schema: {
            options: { type: 'string' }
        },
        play: function () {

        },
        init: function () {
            let me = this;
            let { guiItem, value, id, text, url, imageMargin } = JSON.parse(this.data.options);  // Component data
            me.guiItem = guiItem;
            let entity: any = document.createElement('a-entity');
            entity.setAttribute('rotation', `0 0 0`)

            let imageEntity: any = document.createElement('frame-aspect-ratio-image');
            imageEntity.setAttribute('maxwidth', `${me.guiItem.height - imageMargin}`);
            imageEntity.setAttribute('maxheight', `${me.guiItem.height - imageMargin}`);
            imageEntity.setAttribute('position', `${(-me.guiItem.width / 2) + (me.guiItem.height / 2)} 0 .03`)
            imageEntity.setAttribute('url', url);

            var buttonContainer = document.createElement("frame-gui-button");
            buttonContainer.setAttribute('geometry', `primitive: plane; width: ${me.guiItem.width}; height: ${me.guiItem.height}; depth: 0.02;`);
            buttonContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${GetColor(1)}`);
            buttonContainer.setAttribute('rotation', '0 0 0');
            buttonContainer.setAttribute('panel-color', GetColor(4))
            buttonContainer.setAttribute('grabbanddroppable', JSON.stringify({
                ghost: 'frame-dnd-ghost',
                category: 'image-catalog',
                data: { value, id, text, url }
            }));
            buttonContainer.setAttribute('panel-rounded', "0.1");
            buttonContainer.setAttribute('gap', '0.01')
            buttonContainer.setAttribute('base-depth', '0.01')
            buttonContainer.setAttribute('value', `${text == undefined ? '' : text}` || `${value == undefined ? '' : value}` || ``)
            buttonContainer.setAttribute('font-color', '#ffffff')
            buttonContainer.setAttribute('font-size', '.05')
            buttonContainer.setAttribute('position', `0 0 0.01`);
            buttonContainer.setAttribute('text-position', `0 ${(-me.guiItem.height / 2) + 0.04} .04`)
            buttonContainer.setAttribute('height', me.guiItem.height);
            buttonContainer.setAttribute('margin', `0 0 0.01 0`);
            buttonContainer.setAttribute('width', me.guiItem.width);
            buttonContainer.classList.add('raycastable')
            buttonContainer.addEventListener('click', function () {
                me.el.emit(me.data.selectionevent, { value, id, text, url });
            })
            buttonContainer.appendChild(imageEntity);
            entity.appendChild(buttonContainer);
            this.el.appendChild(entity);
        }
    });
    AFRAME.registerPrimitive('a-dnd-image', {
        defaultComponents: {
            'dnd-image': {}
        },
        mappings: {
            options: 'dnd-image.options'
        }
    });
}