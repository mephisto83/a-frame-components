import { AFRAME } from "../../react/root";
import { GrabAndDropEvents, GrabStartDetails, setInputDevice } from "../../react/systems/grabanddrop";
import { raiseCustomEvent } from "../../react/util";
import { key_grey, key_grey_dark, key_offwhite, key_orange, key_orange_light } from "../vars";
import mixin from "./mixin";

export default function () {
    /* global AFRAME */
    AFRAME.registerComponent('gui-button', {
        schema: {
            on: { default: 'click' },
            value: { type: 'string', default: '' },
            grabbanddroppable: { type: 'string', default: '' },
            fontSize: { type: 'number', default: 0.2 },
            textPosition: { type: 'string', default: '' },
            enableButtonContainer: { type: 'boolean', default: false },
            fontFamily: { type: 'string', default: '' },
            fontColor: { type: 'string', default: key_offwhite },
            borderColor: { type: 'string', default: key_offwhite },
            focusColor: { type: 'string', default: key_orange_light },
            backgroundColor: { type: 'string', default: key_grey },
            hoverColor: { type: 'string', default: key_grey_dark },
            activeColor: { type: 'string', default: key_orange },
            toggle: { type: 'boolean', default: false },
            toggleState: { type: 'boolean', default: false },
        },

        dependencies: ['aframe-troika-text'],

        init: function () {
            let me = this;
            var data = this.data;
            var el = this.el;
            var guiItem = el.getAttribute("gui-item");
            this.guiItem = guiItem;
            /* gui item parameters
                type: {type: 'string'},
                width: {type: 'number', default: 1},
                height: {type: 'number', default: 1},
                baseDepth: {type: 'number', default: 0.01},
                depth: {type: 'number', default: 0.02},
                gap: {type: 'number', default: 0.025},
                radius: {type: 'number', default: 0},
                margin: { type: 'vec4', default: {x: 0, y: 0, z: 0, w: 0}},
    
                bevelEnabled: {type: 'boolean', default: true},
                bevelSegments: {type: 'number', default: 5},
                steps: {type: 'number', default: 2},
                bevelSize: {type: 'number', default: 4},
                bevelThickness: {type: 'number', default: 2}
            */

            //fallback for old font-sizing
            if (data.fontSize > 20) { // 150/1000
                var newSize = data.fontSize / 750;
                data.fontSize = newSize;
            }

            var guiInteractable = el.getAttribute("gui-interactable");
            this.guiInteractable = guiInteractable;
            /* gui interactable parameters
                clickAction: {type: 'string'},
                hoverAction: {type: 'string'},
                keyCode: {type: 'number', default: -1},
                key: {type: 'string'},
            */


            el.setAttribute('geometry', `primitive: plane; 
                                     height: ${guiItem.height}; 
                                     width: ${guiItem.width};
                                     `);
            el.setAttribute('material', `shader: flat; 
                                     transparent: true; 
                                     opacity: 1; 
                                     side:double; 
                                     color:${data.backgroundColor};
                                     `);
            if (this.data.enableButtonContainer) {
                var buttonContainer: any = document.createElement("a-entity");

                if (guiItem.bevel) {
                    var bevelsize_adjust = guiItem.bevelSize * 1;
                    var bevelthickness_adjust = guiItem.bevelThickness;
                    buttonContainer.setAttribute('bevelbox', `width: ${guiItem.width - (guiItem.width * bevelsize_adjust)}; 
                                                      height: ${guiItem.height - (guiItem.height * bevelsize_adjust)}; 
                                                      depth: ${guiItem.baseDepth - (guiItem.baseDepth * bevelthickness_adjust)};
                                                      bevelThickness: 0;
                                                      bevelSize: ${guiItem.bevelSize};
                                                      `);
                    buttonContainer.setAttribute('position', `0 0 0`);
                }
                else {
                    buttonContainer.setAttribute('geometry', `primitive: box; 
                                                      width: ${guiItem.width}; 
                                                      height: ${guiItem.height}; 
                                                      depth: ${guiItem.baseDepth};
                                                      `);
                    buttonContainer.setAttribute('position', `0 0 ${guiItem.baseDepth / 2}`);
                }
                buttonContainer.setAttribute('rotation', '0 0 0');
                buttonContainer.setAttribute('material', `shader: flat; 
                                                  opacity: 1; 
                                                  side:double; 
                                                  color: ${data.borderColor}
                                                  `);
                el.appendChild(buttonContainer);
                this.buttonContainer = buttonContainer;
            }
            var buttonEntity = document.createElement("a-entity");
            if (guiItem.bevel) {
                var bevelsize_adjust = guiItem.bevelSize * 1;
                var bevelthickness_adjust = guiItem.bevelThickness;
                buttonEntity.setAttribute('bevelbox', `width: ${(guiItem.width - guiItem.gap) - ((guiItem.width - guiItem.gap) * bevelsize_adjust)}; 
                                                   height: ${(guiItem.height - guiItem.gap) - ((guiItem.height - guiItem.gap) * bevelsize_adjust)}; 
                                                   depth: ${guiItem.depth - (guiItem.depth * bevelthickness_adjust)};
                                                   bevelThickness: ${guiItem.bevelThickness};
                                                   bevelSize: ${guiItem.bevelSize};
                                                   `);
                buttonEntity.setAttribute('position', `0 0 0`);
            }
            else {
                buttonEntity.setAttribute('geometry', `primitive: box; 
                                               width: ${(guiItem.width - guiItem.gap)}; 
                                               height: ${(guiItem.height - guiItem.gap)}; 
                                               depth: ${guiItem.depth};`);
                buttonEntity.setAttribute('position', `0 0 ${guiItem.depth / 2}`);
            }
            buttonEntity.setAttribute('material', `shader: flat; 
                                               opacity: 1; 
                                               side:double; 
                                               color: ${data.toggleState ? data.activeColor : data.backgroundColor}
                                               `);
            buttonEntity.setAttribute('rotation', '0 0 0');
            el.appendChild(buttonEntity);
            this.buttonEntity = buttonEntity;

            this.setText(data.value);

            if (this.data.grabbanddroppable) {
                el.addEventListener('mousedown', function (event) {
                    let { category, ghost, data } = JSON.parse(me.data.grabbanddroppable);
                    let device = setInputDevice(event);
                    if (device) {
                        let details: GrabStartDetails = {
                            category,
                            component: me,
                            cursorEl: event.detail.cursorEl,
                            data,
                            inputDevice: device,
                            ghost: document.createElement(ghost)
                        }
                        if (me.canRaise === device.id) {
                            me.canRaise = false;
                            raiseCustomEvent(GrabAndDropEvents.GRAB_START, details)
                        }
                    }
                });
                el.addEventListener('mouseup', function (event) {
                });
                el.addEventListener('mouseenter', function (event) {
                    let device = setInputDevice(event);
                    console.log(event);
                    if (!me.canRaise) {
                        me.canRaise = device.id;
                        console.log(`grabbanddroppable element mouse enter ${device.id}`);
                    }
                    event.preventDefault();
                });
                el.addEventListener('mouseleave', function (event) {
                    let device = setInputDevice(event);
                    if (me.canRaise === device.id) {
                        me.canRaise = false;
                        console.log(`grabbanddroppable element mouse leave ${device.id}`);
                    }
                    event.preventDefault();
                });
            }

            el.addEventListener('mouseenter', function (event) {
                buttonEntity.removeAttribute('animation__leave');
                if (!(data.toggle)) {
                    buttonEntity.setAttribute('animation__enter', `property: material.color; from: ${data.backgroundColor}; to:${data.hoverColor}; dur:200;`);
                }
            });

            el.addEventListener('mouseleave', function (event) {
                if (!(data.toggle)) {
                    buttonEntity.removeAttribute('animation__click');
                    buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
                }
                buttonEntity.removeAttribute('animation__enter');
            });


            el.addEventListener('focus', function (event) {
                if (buttonContainer) {
                    buttonContainer.setAttribute('material', 'color', `${data.focusColor}`);
                }
            });

            el.addEventListener('blur', function (event) {
                if (buttonContainer) {
                    buttonContainer.setAttribute('material', 'color', `${data.borderColor}`);
                    if (!(data.toggle)) {
                        buttonEntity.removeAttribute('animation__click');
                        buttonEntity.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.backgroundColor}; dur:200; easing: easeOutQuad;`);
                    }
                    buttonEntity.removeAttribute('animation__enter');
                }
            });




            el.addEventListener(data.on, function (event) {
                if (!(data.toggle)) { // if not toggling flashing active state
                    buttonEntity.setAttribute('animation__click', `property: material.color; from: ${data.activeColor}; to:${data.backgroundColor}; dur:400; easing: easeOutQuad;`);
                } else {
                    var guiButton = el.components['gui-button']
                    // console.log("about to toggle, current state: " + guiButton.data.toggleState);
                    guiButton.setActiveState(!guiButton.data.toggleState);
                    //  buttonEntity.setAttribute('material', 'color', data.activeColor);
                }

                var clickActionFunctionArgs = guiInteractable.clickActionArgs;
                var clickActionFunctionName = guiInteractable.clickAction;
                // console.log("in button, clickActionFunctionName: "+clickActionFunctionName);
                // find object
                let args = [];
                if (`${clickActionFunctionName}`.includes('$')) {
                    let parts = clickActionFunctionName.split('$');
                    clickActionFunctionName = parts[0];
                    for (let i = 1; i < parts.length; i++) {
                        args.push(parts[i]);
                    }
                }
                var clickActionFunction: any = window[clickActionFunctionName];
                //console.log("clickActionFunction: "+clickActionFunction);
                // is object a function?
                if (typeof clickActionFunction === "function") clickActionFunction(event, args);
            });



            el.addEventListener("keyup", function (event) {
                if (event.isComposing || event.keyCode === 229) {
                    return;
                }

                if (event.keyCode == 13 || event.keyCode == 32) {
                    el.emit(data.on);
                }
                event.preventDefault();

            });

            ////WAI ARIA Support
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', data.value);



        },
        ...mixin,
        play: function () {

        },
        update: function (oldData) {

            var data = this.data;
            var el = this.el;
            var guiItem = el.getAttribute("gui-item");
            this.guiItem = guiItem;

            el.setAttribute('geometry', `primitive: plane; 
                                     height: ${guiItem.height}; 
                                     width: ${guiItem.width};
                                     `);
            el.setAttribute('material', `shader: flat; 
                                     transparent: true; 
                                     opacity: 1; 
                                     side:double; 
                                     color:${data.backgroundColor};
                                     `);
            if (this.data.enableButtonContainer) {
                if (guiItem.bevel) {
                    var bevelsize_adjust = guiItem.bevelSize * 1;
                    var bevelthickness_adjust = guiItem.bevelThickness;
                    this.buttonContainer.setAttribute('bevelbox', `width: ${guiItem.width - (guiItem.width * bevelsize_adjust)}; 
                                                           height: ${guiItem.height - (guiItem.height * bevelsize_adjust)}; 
                                                           depth: ${guiItem.baseDepth - (guiItem.baseDepth * bevelthickness_adjust)};
                                                           bevelThickness: 0;
                                                           bevelSize: ${guiItem.bevelSize};
                                                           `);
                    this.buttonContainer.setAttribute('position', `0 0 0`);
                }
                else {
                    this.buttonContainer.setAttribute('geometry', `primitive: box; 
                                                       width: ${guiItem.width}; 
                                                       height: ${guiItem.height}; 
                                                       depth: ${guiItem.baseDepth};
                                                       `);
                    this.buttonContainer.setAttribute('position', `0 0 ${guiItem.baseDepth / 2}`);
                }
                this.buttonContainer.setAttribute('material', `shader: flat; 
                                                       opacity: 1; 
                                                       side:double; 
                                                       color: ${data.borderColor}
                                                       `);
            }

            if (guiItem.bevel) {
                var bevelsize_adjust = guiItem.bevelSize * 1;
                var bevelthickness_adjust = guiItem.bevelThickness;
                this.buttonEntity.setAttribute('bevelbox', `width: ${(guiItem.width - guiItem.gap) - ((guiItem.width - guiItem.gap) * bevelsize_adjust)}; 
                                                        height: ${(guiItem.height - guiItem.gap) - ((guiItem.height - guiItem.gap) * bevelsize_adjust)}; 
                                                        depth: ${guiItem.depth - (guiItem.depth * bevelthickness_adjust)};
                                                        bevelThickness: ${guiItem.bevelThickness};
                                                        bevelSize: ${guiItem.bevelSize};
                                                        `);
                this.buttonEntity.setAttribute('position', `0 0 0`);
            }
            else {
                this.buttonEntity.setAttribute('geometry', `primitive: box; 
                                               width: ${(guiItem.width - guiItem.gap)}; 
                                               height: ${(guiItem.height - guiItem.gap)}; 
                                               depth: ${guiItem.depth};
                                               `);
                this.buttonEntity.setAttribute('position', `0 0 ${guiItem.depth / 2}`);
            }
            this.buttonEntity.setAttribute('material', `shader: flat; 
                                                    opacity: 1; 
                                                    side:double; 
                                                    color: ${data.toggleState ? data.activeColor : data.backgroundColor}
                                                    `);

            if (this.textEntity) {
                console.log("has textEntity: " + this.textEntity);

                var oldEntity = this.textEntity;
                oldEntity.parentNode.removeChild(oldEntity);

                this.setText(this.data.value);

            } else {
                console.log("no textEntity!");
            }
            this.updateElementSize(this, this.el);
        },
        setActiveState: function (activeState) {
            // console.log("in setActiveState function, new state: " + activeState);
            this.data.toggleState = activeState;
            if (!activeState) {
                console.log('not active, about to set background color');
                this.buttonEntity.setAttribute('material', 'color', this.data.backgroundColor);
            } else {
                console.log('active, about to set active color');
                this.buttonEntity.setAttribute('material', 'color', this.data.activeColor);
            }
        },
        setText: function (newText) {
            var data = this.data;
            var el = this.el;
            var guiItem = el.getAttribute("gui-item");

            var textEntity = document.createElement("a-entity");
            this.textEntity = textEntity;
            textEntity.setAttribute('troika-text', `value: ${newText}; 
                                                align:center; 
                                                anchor:center; 
                                                baseline:center;
                                                letterSpacing:0;
                                                color:${data.fontColor};                                                
                                                font:${data.fontFamily};
                                                fontSize:${data.fontSize};
                                                depthOffset:1;
                                                maxWidth:${guiItem.width / 1.05};
                                                `);
            textEntity.setAttribute('troika-text-material', `shader: flat;`);
            if (this.data.textPosition) {
                textEntity.setAttribute('position', this.data.textPosition);
            } else if (guiItem.bevel) {
                textEntity.setAttribute('position', `0 0 ${guiItem.depth + (guiItem.bevelThickness / 2) + 0.05}`);
            } else {
                textEntity.setAttribute('position', `0 0 ${(guiItem.depth / 2) + 0.05}`);
            }
            //        textEntity.setAttribute('troika-text-material', `shader: flat;`);
            this.buttonEntity.appendChild(textEntity);
        },
    });


    AFRAME.registerPrimitive('a-gui-button', {
        defaultComponents: {
            'gui-interactable': {},
            'gui-item': { type: 'button' },
            'gui-button': {}
        },
        mappings: {
            //gui interactable general
            'onclick': 'gui-interactable.clickAction',
            'clickArgs': 'gui-interactable.clickActionArgs',
            'onhover': 'gui-interactable.hoverAction',
            'key-code': 'gui-interactable.keyCode',
            //gui item general
            'color-change-animation': 'gui-item.color-change-animation',
            'width': 'gui-item.width',
            'height': 'gui-item.height',
            'depth': 'gui-item.depth',
            'base-depth': 'gui-item.baseDepth',
            'gap': 'gui-item.gap',
            'radius': 'gui-item.radius',
            'margin': 'gui-item.margin',
            //gui item bevelbox
            'bevel': 'gui-item.bevel',
            'bevel-segments': 'gui-item.bevelSegments',
            'steps': 'gui-item.steps',
            'bevel-size': 'gui-item.bevelSize',
            'bevel-offset': 'gui-item.bevelOffset',
            'bevel-thickness': 'gui-item.bevelThickness',
            //gui button specific
            'on': 'gui-button.on',
            'grabbanddroppable': 'gui-button.grabbanddroppable',
            'value': 'gui-button.value',
            'font-size': 'gui-button.fontSize',
            'text-position': 'gui-button.textPosition',
            'enable-button-container': 'gui-button.enableButtonContainer',
            'font-family': 'gui-button.fontFamily',
            'font-color': 'gui-button.fontColor',
            'border-color': 'gui-button.borderColor',
            'focus-color': 'gui-button.focusColor',
            'background-color': 'gui-button.backgroundColor',
            'hover-color': 'gui-button.hoverColor',
            'active-color': 'gui-button.activeColor',
            'toggle': 'gui-button.toggle',
            'toggle-state': 'gui-button.toggleState'
        }
    });

}