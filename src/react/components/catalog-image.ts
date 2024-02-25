import { AFRAME } from "../../react/root";
import { GetColor } from "../systems/ui";
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('catalog-ghost', {
        schema: {
            options: { type: 'string' }
        },
        init: function () {
            let skins = [
                'assets/images/black_white_ghost.png',
                'assets/images/green_white_ghost.png',
                'assets/images/purple_ghost.png',
            ];
            let skin = skins[Math.floor(Math.random() * skins.length)];

            let imageCube: any = document.createElement('a-image-cube');
            imageCube.setAttribute('src', `url(${skin})`)
            imageCube.setAttribute('size', .2)
            this.el.appendChild(imageCube);
        }
    });
    AFRAME.registerPrimitive('a-catalog-ghost', {
        defaultComponents: {
            'catalog-ghost': {}
        },
        mappings: {
            options: 'catalog-ghost.options'
        }
    })
    AFRAME.registerComponent('catalog-image', {
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

            let imageEntity: any = document.createElement('a-aspect-ratio-image');
            imageEntity.setAttribute('maxwidth', `${me.guiItem.height - imageMargin}`);
            imageEntity.setAttribute('maxheight', `${me.guiItem.height - imageMargin}`);
            imageEntity.setAttribute('position', `${(-me.guiItem.width / 2) + (me.guiItem.height / 2)} 0 .03`)
            imageEntity.setAttribute('url', url);

            var buttonContainer = document.createElement("a-gui-button");
            buttonContainer.setAttribute('geometry', `primitive: plane; width: ${me.guiItem.width}; height: ${me.guiItem.height}; depth: 0.02;`);
            buttonContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${GetColor(1)}`);
            buttonContainer.setAttribute('rotation', '0 0 0');
            buttonContainer.setAttribute('panel-color', GetColor(4))
            buttonContainer.setAttribute('grabbanddroppable', JSON.stringify({ ghost: 'a-catalog-ghost', category: 'image-catalog', data: { value, id, text, url } }));
            buttonContainer.setAttribute('panel-rounded', "0.1");
            buttonContainer.setAttribute('gap', '0.01')
            buttonContainer.setAttribute('base-depth', '0.01')
            buttonContainer.setAttribute('value', text || value || ``)
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
    AFRAME.registerPrimitive('a-catalog-image', {
        defaultComponents: {
            'catalog-image': {}
        },
        mappings: {
            options: 'catalog-image.options'
        }
    });
}