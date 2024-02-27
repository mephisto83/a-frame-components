import { AFRAME } from "../../react/root";
import mixin from "./mixin";
import { GetBackgroundColor } from "../../react/systems/ui";
import { key_grey, key_grey_dark, key_grey_light, key_offwhite, key_orange, key_white } from "../vars";

export default function () {
    const THREE: any = (window as any).THREE;
    AFRAME.registerComponent('base-interactive', {
        schema: {
            on: { default: 'click' },
            value: { type: 'string', default: '' },
            active: { type: 'boolean', default: true },
            interactiveType: { type: 'string', default: '' },
            paddingLeft: { type: 'number', default: 0.1 },
            show: { type: 'boolean', default: true },
            toggle: { type: 'boolean', default: false },
            beingEdited: { type: 'boolean', default: false },
            toggleState: { type: 'boolean', default: false },
            checked: { type: 'boolean', default: false },
            cursorPosition: { type: 'number', default: 0 },
            title: { type: 'string', default: '' },
            resizeOnText: { type: 'boolean', default: false },
            radiosizecoef: { type: 'number', default: 1 },
            fontSize: { type: 'number', default: 0.2 },
            fontFamily: { type: 'string', default: '' },
            fontColor: { type: 'string', default: "#ffffff" },
            borderColor: { type: 'string', default: '#000000' },
            backgroundColor: { type: 'string', default: '#000000' },
            backgroundTextColor: { type: 'string', default: '#333333' },
            hoverColor: { type: 'string', default: '#A9A9A9' },
            hoverTextColor: { type: 'string', default: '#000000' },
            activeColor: { type: 'string', default: '#FFFF00' },
            activeTextColor: { type: 'string', default: '#FFFFFF' },
            disabledColor: { type: 'string', default: '#E8E8E8' },
            disabledTextColor: { type: 'string', default: '#BEBEBE' },
            handleColor: { type: 'string', default: '#444444' },
        },
        ...mixin,
        init: function () {
            let me = this;
            var data = this.data;
            var el = this.el;
            let guiItem: any = el.getAttribute("gui-item");
            this.guiItem = guiItem;
            var guiInteractable = el.getAttribute("gui-interactable");
            this.guiInteractable = guiInteractable;
            this.defaultSize = {
                height: this.data.height,
                width: this.data.width
            }
            this.renderCheck = this.renderCheck.bind(this);
            //fallback for old font-sizing
            if (data.fontSize > 20) { // 150/750
                var newSize = data.fontSize / 750;
                data.fontSize = newSize;
            }
            let background: any = document.createElement('a-rounded');
            background.setAttribute("gui-interactable", guiInteractable)
            background.setAttribute('width', guiItem.width)
            background.setAttribute('height', guiItem.height)
            background.setAttribute('radius', Math.min(parseFloat(`${guiItem.width}`), parseFloat(`${guiItem.height}`)) * .1)
            background.setAttribute('color', GetBackgroundColor());
            this.background = background;
            el.appendChild(background);
            switch (data.interactiveType) {
                case 'icon-button':
                case 'button':
                    this.setButtonEvents({ el, background, data, guiItem });
                    break;
                case 'text':
                    break;
                default:
                    this.setRadioButton({ el, data, guiItem });
                    break;
            }
            switch (data.interactiveType) {
                case 'icon-button':
                    this.setIcon(data.value);
                    break;
                case 'input':
                    this.setText(data.title || data.value);
                    break;
                case 'button':
                default:
                    this.setText(data.title || data.value);
                    break;
            }

            el.addEventListener(data.on, function (evt: any) {
                el.emit('clicked', {
                    data: me.data
                });
                el.emit('item-clicked', {
                    data: me.data
                })
                evt.preventDefault();
            });

            ////WAI ARIA Support
            el.setAttribute('role', 'radio');
            me.renderCheck(data);
            me.updateElementSize(me, me.el);

        },
        setButtonEvents: function ({ el, background, data, guiItem }) {
            background.setAttribute('opacity', `.95`);
            let me = this;
            el.addEventListener('mouseenter', function (evt) {
                background.setAttribute('color', `${data.hoverColor}`);
                if (me.textEntity)
                    me.textEntity.setAttribute('color', `${data.hoverTextColor}`);
            });
            el.addEventListener('mouseleave', function (evt) {
                background.setAttribute('color', `${data.backgroundColor}`);
                if (me.textEntity)
                    me.textEntity.setAttribute('color', `${data.backgroundTextColor}`);
            });
            el.addEventListener('mouseout', function (evt) {
                background.setAttribute('color', `${data.backgroundColor}`);
                if (me.textEntity)
                    me.textEntity.setAttribute('color', `${data.backgroundTextColor}`);
            });
            el.addEventListener('mousedown', function (evt) {
                background.setAttribute('color', `${data.activeColor}`);
                if (me.textEntity)
                    me.textEntity.setAttribute('color', `${data.activeTextColor}`);
            });
            el.addEventListener('mouseup', function (evt) {
                background.setAttribute('color', `${data.hoverColor}`);
                if (me.textEntity)
                    me.textEntity.setAttribute('color', `${data.hoverTextColor}`);
            });
        },
        positionRadioButton: function ({ guiItem }) {
            if (this.radioBox) {
                var radioBoxX = -guiItem.width * 0.5 + guiItem.height * 0.5;
                let radioBox = this.radioBox;
                radioBox.setAttribute('position', `${radioBoxX} 0 0`);
            }
        },
        setRadioButton: function ({ el, data, guiItem }) {
            var radioBoxX = -guiItem.width * 0.5 + guiItem.height * 0.5;
            var radioBox: any = document.createElement("a-cylinder");
            radioBox.setAttribute('radius', guiItem.height * 0.2 * data.radiosizecoef);
            radioBox.setAttribute('height', '0.01');
            radioBox.setAttribute('rotation', '90 0 0');
            radioBox.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
            radioBox.setAttribute('position', `${radioBoxX} 0 0`);
            el.appendChild(radioBox);

            var radioborder: any = document.createElement("a-torus");
            radioborder.setAttribute('radius', guiItem.height * 0.19 * data.radiosizecoef);
            radioborder.setAttribute('radius-tubular', '0.01');
            radioborder.setAttribute('rotation', '90 0 0');
            radioborder.setAttribute('material', `color:${data.borderColor}; shader: flat;`);
            radioBox.appendChild(radioborder);

            var radioCenter: any = document.createElement("a-cylinder");
            this.radioCenter = radioCenter;
            radioCenter.setAttribute('radius', guiItem.height * 0.18 * data.radiosizecoef);
            radioCenter.setAttribute('height', '0.02');
            radioCenter.setAttribute('rotation', '0 0 0');
            radioCenter.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
            radioBox.appendChild(radioCenter);

            this.radioBox = radioBox;
            el.addEventListener('mouseenter', function (evt) {
                radioborder.removeAttribute('animation__leave');
                radioborder.setAttribute('animation__enter', `property: material.color; to:${data.hoverColor}; dur:200;`);
            });
            el.addEventListener('mouseleave', function (evt) {
                radioborder.removeAttribute('animation__enter');
                radioborder.setAttribute('animation__leave', `property: material.color; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
            });

        },
        setIcon: function (unicode) {
            var hex = parseInt(unicode, 16);
            var char = String.fromCharCode(hex);
            var iconEntity = document.createElement("a-entity");
            var iconEntityX = 0;
            if (this.data.value != '') {
                iconEntityX = -this.guiItem.width * 0.5 + this.guiItem.height * 0.5;
            }
            this.iconEntity = iconEntity;
            iconEntity.setAttribute('troika-text', `value:${char}; 
                                                align:center; 
                                                anchor:center; 
                                                baseline:center;
                                                color:${this.data.fontColor};
                                                font:${this.data.iconFont || "assets/fonts/ionicons.ttf"};
                                                fontSize:${this.data.iconFontSize || "0.1"};
                                                depthOffset:1;
                                                `);
            iconEntity.setAttribute('position', `${iconEntityX} 0 0.05`); // 0.05 y axis adjustment for fontawesome
            this.el.appendChild(iconEntity);
        },
        renderCheck: function (data) {
            let radioCenter = this.radioCenter;
            if (radioCenter) {
                if (data.checked) {
                    radioCenter.setAttribute('animation__color', `property: material.color;  to:${data.activeColor}; dur:500; easing:easeInOutCubic;`);
                    radioCenter.setAttribute('animation__rotation', `property: rotation; from: 0 0 0; to:-180 0 0; dur:500; easing:easeInOutCubic;`);
                    radioCenter.setAttribute('animation__position1', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic;`);
                    radioCenter.setAttribute('animation__position2', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
                } else {
                    radioCenter.setAttribute('animation__color', `property: material.color;  to:${data.handleColor}; dur:500; easing:easeInOutCubic;`);
                    radioCenter.setAttribute('animation__rotation', `property: rotation; from: -180 0 0; to:0 0 0; dur:500; easing:easeInOutCubic;`);
                    radioCenter.setAttribute('animation__position1', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic; `);
                    radioCenter.setAttribute('animation__position2', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
                }
            }
        },
        update: function (oldData) {
            let me = this;
            var data = this.data;
            this.guiItem = this.el.getAttribute('gui-item');
            if (this.guiItem.width !== oldData.width) {
                this.background.setAttribute('width', this.guiItem.width)
            }
            if (this.guiItem.height !== oldData.height) {
                this.background.setAttribute('height', this.guiItem.height)
            }
            this.renderCheck(data)
            if (this.data.show !== oldData.show) {
                this.el.setAttribute('visible', this.data.show)
            }

            if (this.textEntity) {
                this.setText(this.data.value);
            }
            this.positionRadioButton({ guiItem: this.guiItem });
            me.updateElementSize(me, me.el);
        },
        setText: function (newText) {
            let me = this;
            let data = this.data;
            var textEntityX = 0;
            switch (data.interactiveType) {
                case 'button':
                case 'text':
                    textEntityX = -this.guiItem.width * 0.5 + this.data.paddingLeft;
                    break;
                default:
                    textEntityX = this.guiItem.height - this.guiItem.width * 0.5;
                    break;
            }

            var textEntity: any = this.textEntity;
            if (!textEntity) {
                textEntity = document.createElement("a-entity");
                this.textEntity = textEntity;
                textEntity.setAttribute('troika-text', `align:left; 
                                                anchor:left; 
                                                baseline:center;
                                                letterSpacing:0;
                                                color:${this.data.fontColor};
                                                font:${this.data.fontFamily};
                                                fontSize:${this.data.fontSize};
                                                depthOffset:1;
                                                maxWidth:${this.guiItem.width / 1.05};
                                                `);
                if (me.data.resizeOnText) {
                    textEntity.addEventListener('bounding-box-update', (evt: any) => {
                        let { detail } = evt;
                        if (detail) {
                            let { box } = detail;
                            if (box) {
                                me.el.emit('text-size-change', { value: box })
                                let { max, min } = box;
                                if (max && min) {
                                    let width = (this.defaultSize.height) + Math.max(Math.abs(max.x - min.x), (this.defaultSize).width || 0);
                                    me.el.setAttribute('width', width);
                                }
                            }
                        }
                        evt.preventDefault();
                        evt.stopPropagation();
                    })
                }
                this.el.appendChild(textEntity);
            }
            textEntity.setAttribute('position', `${textEntityX} 0 0.02`);
            textEntity.setAttribute('troika-text', `being-edited`, `${this.data.beingEdited}`);
            textEntity.setAttribute('troika-text', `beingEdited`, `${this.data.beingEdited}`);
            textEntity.setAttribute('troika-text', 'cursorPosition', this.data.cursorPosition);
            textEntity.setAttribute('troika-text', `value`, `${newText}`);
        }
    });

    AFRAME.registerPrimitive('a-base-interactive', {
        defaultComponents: {
            'gui-interactable': {},
            'menuable': {},
            'gui-item': { type: 'radio' },
            'base-interactive': {}
        },
        mappings: {
            'onclick': 'gui-interactable.clickAction',
            'onhover': 'gui-interactable.hoverAction',
            'key-code': 'gui-interactable.keyCode',
            'width': 'gui-item.width',
            'height': 'gui-item.height',
            'show': 'guid-radio.show',
            'interactive-type': 'base-interactive.interactiveType',
            'margin': 'gui-item.margin',
            'on': 'base-interactive.on',
            'padding-left': 'base-interactive.paddingLeft',
            'value': 'base-interactive.value',
            'title': 'base-interactive.title',
            'active': 'base-interactive.active',
            'being-edited': 'base-interactive.beingEdited',
            'resize-on-text': 'base-interactive.resizeOnText',
            'checked': 'base-interactive.checked',
            'cursor-position': 'base-interactive.cursorPosition',
            'font-color': 'base-interactive.fontColor',
            'font-size': 'base-interactive.fontSize',
            'font-family': 'base-interactive.fontFamily',
            'border-color': 'base-interactive.borderColor',
            'background-color': 'base-interactive.backgroundColor',
            'hover-color': 'base-interactive.hoverColor',
            'active-color': 'base-interactive.activeColor',
            'handle-color': 'base-interactive.handleColor',
            'radiosizecoef': 'base-interactive.radiosizecoef'
        }
    });
}