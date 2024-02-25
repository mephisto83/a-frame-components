import { AFRAME } from "../../react/root";
import { GetColor } from "../../react/systems/ui";
export default function () {
    AFRAME.registerComponent('model-item', {
        schema: {
            selectionevent: { type: 'string' },
            options: { type: 'string' }
        },
        init: function () {
            let me = this;
            let { guiItem, value, id, text, url, imageMargin } = JSON.parse(this.data.options);  // Component data
            me.imageMargin = imageMargin;
            me.guiItem = guiItem;

            let entity: any = document.createElement('a-entity');
            entity.setAttribute('rotation', `0 0 0`)

            let imageEntity: any = document.createElement('a-aspect-ratio-image');
            imageEntity.setAttribute('maxwidth', `${me.guiItem.height - me.imageMargin}`);
            imageEntity.setAttribute('maxheight', `${me.guiItem.height - me.imageMargin}`);
            imageEntity.setAttribute('position', `${(-me.guiItem.width / 2) + (me.guiItem.height / 2)} 0 .03`)
            imageEntity.setAttribute('url', url);

            var buttonContainer = document.createElement("a-gui-button");
            buttonContainer.setAttribute('geometry', `primitive: plane; width: ${me.guiItem.width}; height: ${me.guiItem.height}; depth: 0.02;`);
            buttonContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${GetColor(1)}`);
            buttonContainer.setAttribute('rotation', '0 0 0');
            buttonContainer.setAttribute('panel-color', GetColor(4))
            buttonContainer.setAttribute('panel-rounded', "0.1");
            buttonContainer.setAttribute('gap', '0.01')
            buttonContainer.setAttribute('base-depth', '0.01')
            buttonContainer.setAttribute('value', ``)
            buttonContainer.setAttribute('font-color', '#ffffff')
            buttonContainer.setAttribute('font-size', '.05')
            buttonContainer.setAttribute('position', `0 0 0.01`);
            buttonContainer.setAttribute('text-position', `0 ${(-me.guiItem.height / 2) + 0.04} .04`)
            buttonContainer.setAttribute('onclick', `testButtonAction`);
            buttonContainer.setAttribute('height', me.guiItem.height);
            buttonContainer.setAttribute('margin', `0 0 0.01 0`);
            buttonContainer.setAttribute('width', me.guiItem.width);
            buttonContainer.classList.add('raycastable')
            buttonContainer.addEventListener('click', function () {
                me.el.emit(me.data.selectionevent, { value, id, text, url });
            })

            let menu = me.createMenu({
                width: me.guiItem.width,
                text: text || value || ``,
                height: me.guiItem.height,
                options: { value, id, text, url }
            });
            buttonContainer.appendChild(imageEntity);
            entity.appendChild(menu);
            entity.appendChild(buttonContainer);
            this.el.appendChild(entity);
        },
        createMenu: function ({ width, text, height, options }) {
            let me = this;
            let open = false;
            let menuContainer = document.createElement('a-menu-container');
            menuContainer.setAttribute('menu-direction', 'up');
            menuContainer.setAttribute('flex-direction', 'column');
            menuContainer.setAttribute('justify-content', 'flexStart');
            menuContainer.setAttribute('algin-items', 'flexStart');
            menuContainer.setAttribute('component-padding', '.01');
            menuContainer.setAttribute('width', width);
            menuContainer.setAttribute('text-value', text);
            menuContainer.setAttribute('menu-item-height', `.2`);
            menuContainer.setAttribute('menu-item-width', width);
            menuContainer.addEventListener('click', (evt) => {
                evt.preventDefault();
                open = !open;
                menuContainer.setAttribute('open', `${open}`)
                return false;
            });

            let promptButton = document.createElement('a-base-interactive');
            promptButton.setAttribute('width', width)
            promptButton.setAttribute('height', '.2');
            promptButton.setAttribute('interactive-type', "button");
            promptButton.setAttribute('value', 'Select');
            promptButton.setAttribute('margin', '0 0 0.05 0');
            promptButton.setAttribute('font-size', '.07');
            promptButton.addEventListener('click', (evt) => {
                evt.preventDefault();
                me.el.emit(me.data.selectionevent, options);

                return null;
            })
            menuContainer.appendChild(promptButton);
            let entity = document.createElement('a-entity');
            entity.setAttribute('position', `0 ${(-height / 2)} .1`)
            entity.appendChild(menuContainer);
            return entity;
            //     <a-menu-container
            //     ref={menuContainerRef}
            //     menu-direction={'up'}
            //     flex-direction="column"
            //     justify-content="flexStart"
            //     align-items="flexStart"
            //     component-padding="0.01"
            //     width="4"
            //     text-value="All Images"
            //     menu-item-height={.2}
            //     menu-item-width={1.0}
            //     position="0 0 0" rotation="0 180 0"
            // >
        },
        createText: function (newText) {
            var textEntity = document.createElement("a-entity");
            textEntity.setAttribute('troika-text', `value: ${newText}; 
                                                align:center; 
                                                anchor:center; 
                                                baseline:center;
                                                letterSpacing:0;
                                                color:${this.data.fontColor || '#ffffff'};
                                                font:${this.data.fontFamily};
                                                fontSize:${'14px'};
                                                depthOffset:1;
                                                maxWidth:611;
                                                `);
            textEntity.setAttribute('position', `0 0 0.01`);
            let scle = 0.004;
            textEntity.setAttribute('scale', `${scle} ${scle} ${scle}`);

            //        textEntity.setAttribute('troika-text-material', `shader: flat;`);
            return (textEntity);
        },
    });
    AFRAME.registerPrimitive('a-model-item', {
        defaultComponents: {
            'model-item': {}
        },
        mappings: {
            options: 'model-item.options',
            selectionevent: 'model-item.selectionevent'
        }
    });

    AFRAME.registerComponent('prompt-popup', {
        schema: {
            text: { type: 'string' }
        },
        init: function () {
            let me = this;
            let panel = document.createElement('a-rounded');
            panel.setAttribute('width', '2');
            panel.setAttribute('height', '2');
            panel.setAttribute('radius', '.1')
            panel.setAttribute('color', '#000');
            panel.setAttribute('opacity', '.3');
            let txt = this.createText(this.data.text);
            txt.setAttribute('position', '0 0 .1');

            me.el.appendChild(panel);
            me.el.appendChild(txt);
        },
        createText: function (newText) {
            var textEntity = document.createElement("a-entity");
            textEntity.setAttribute('troika-text', `value: ${newText}; 
                                                align:center; 
                                                anchor:center; 
                                                baseline:center;
                                                letterSpacing:0;
                                                color:${this.data.fontColor || '#ffffff'};
                                                font:${this.data.fontFamily || "assets/fonts/Plaster-Regular.ttf"};
                                                fontSize:${'14px'};
                                                depthOffset:1;
                                                maxWidth:611;
                                                `);
            textEntity.setAttribute('position', `0 0 0.01`);
            let scle = 0.004;
            textEntity.setAttribute('scale', `${scle} ${scle} ${scle}`);

            //        textEntity.setAttribute('troika-text-material', `shader: flat;`);
            return (textEntity);
        },
    })
    AFRAME.registerPrimitive('a-prompt-popup', {
        defaultComponents: {
            'prompt-popup': {}
        },
        mappings: {
            text: 'prompt-popup.text',
        }
    });

}