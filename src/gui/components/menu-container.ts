import { AFRAME } from "../../react/root";
import { customEventListener } from "../../react/systems/grabanddrop";
import { raiseCustomEvent } from "../../react/util";
import { generateUniqueId } from "../../util";
import { key_grey } from "../vars";
import mixin from "./mixin";

export default function () {
    var onAppendChildToContainer = function (elem, f) {
        // console.log("in onAppend, elem: "+elem);
        var observer = new MutationObserver(function (mutations, me) {
            //console.log("in mutationObserver, me: "+me);
            mutations.forEach(function (m) {
                console.log(m);
                if (m.addedNodes.length) {
                    f(m.target, m.addedNodes)
                }
            })
        })
        observer.observe(elem, { childList: true })
    }

    AFRAME.registerComponent('ui-menu-container', {
        schema: {
            flexDirection: { type: 'string', default: 'row' },
            value: { type: 'string', default: '' },
            selected: { type: 'number', default: 0 },
            open: { type: 'boolean', default: false },
            justifyContent: { type: 'string', default: 'flexStart' },
            alignItems: { type: 'string', default: 'flexStart' },
            text: { type: 'string', default: '' },
            itemPadding: { type: 'number', default: 0.0 },
            menuItemWidth: { type: 'number', default: 1.0 },
            menuItemMargin: { type: 'number', default: .02 },
            easing: { type: 'string', default: 'easeInOutQuad' },
            dur: { type: 'number', default: 400 },
            forwardStep: { type: 'number', default: 0.05 },
            menuItemHeight: { type: 'number', default: 1.0 },
            menuDirection: { type: 'string', default: 'down' },
            opacity: { type: 'number', default: 0.0 },
            isTopContainer: { type: 'boolean', default: false },
            panelColor: { type: 'string', default: key_grey },
            panelRounded: { type: 'number', default: 0.05 },

            //global settings for GUI items
            styles: {
                fontFamily: { type: 'string', default: 'Helvetica' },
                // fontColor: { type: 'string', default: key_offwhite },
                // borderColor: { type: 'string', default: key_offwhite },
                // backgroundColor: { type: 'string', default: key_grey },
                // hoverColor: { type: 'string', default: key_grey_dark },
                // activeColor: { type: 'string', default: key_orange },
                // handleColor: { type: 'string', default: key_offwhite },
            }

        },
        init: function () {
            let me = this;
            var containerGuiItem = this.el.getAttribute("gui-item");
            let id = generateUniqueId();
            me.internalId = id;

            if (this.data.isTopContainer) {
                this.setBackground();
            } else {
            }

            this.children = this.el.getChildEntities();

            this.positionChildren(containerGuiItem);
            let { entity, bucket, entryPanel } = this.createEntryPanel();
            this.el.addEventListener('item-clicked', (evt) => {
                const { detail } = evt;
                if (detail?.data?.value !== me.data.value) {
                    me.el.emit('change', { value: detail?.data?.value })
                }
                evt.preventDefault();
                evt.stopPropagation();
            });
            let { cursorX, cursorY } = this.getInitialCursor(containerGuiItem);
            let { x, y, z } = this.getChildPositions({
                childElement: this.children[0],
                containerGuiItem,
                cursorX,
                cursorY
            });
            entryPanel.addEventListener('item-clicked', (evt) => {
                if (!me.data.open) {
                    raiseCustomEvent('menu-open', { id: me.internalId });
                };
                me.el.setAttribute('open', !me.data.open);
                evt.preventDefault();
                evt.stopPropagation();
            })
            let cleanup = customEventListener('menu-open', (detail: { id: string }, evt) => {
                if (detail.id !== me.internalId) {
                    if (me.data.open) {
                        me.el.setAttribute('open', false);
                    }
                }
            });
            this.cleanup = cleanup;
            // entity.setAttribute('position', `${x} ${y} ${z}`);
            this.entryPanelContainer = entity;
            this.entryPanel = entryPanel;
            this.el.appendChild(this.entryPanelContainer);

            onAppendChildToContainer(this.el, function (containerElement, addedChildren) {
                //console.log('****** containerElement: ' + containerElement);
                //console.log('****** addedChildren: ' + addedChildren.length);
                // containerElement.components['ui-menu-container'].init();
                var addedChild = addedChildren[0];
                addedChildren[0].addEventListener("loaded", (e) => {
                    //console.log('in appended element loaded handler: '+e);
                    //console.log('addedChild: '+addedChild);
                    //console.log('****** containerElement: ' + containerElement);
                    containerElement.components['ui-menu-container'].init();
                })
            })
            this.updateElementSize(me, me.el);
        },
        createEntryPanel: function () {
            let entryPanel: any = document.createElement('frame-base-interactive');
            entryPanel.setAttribute('height', this.data.menuItemHeight);
            entryPanel.setAttribute('width', this.data.menuItemWidth);
            entryPanel.setAttribute('enabled', true);
            entryPanel.setAttribute('value', this.data.text)
            entryPanel.setAttribute('position', `0 0 0`);
            entryPanel.setAttribute('margin', "0 0 0.05 0")
            entryPanel.setAttribute('font-size', ".07")
            let entity = document.createElement('a-entity');
            let entity2 = document.createElement('a-entity');
            entity.appendChild(entryPanel);
            entity.appendChild(entity2);
            return { entity, bucket: entity2, entryPanel };
        },
        getInitialCursor: function (containerGuiItem: any) {
            var cursorX = 0;
            var cursorY = 0;
            return { cursorX, cursorY }
        },
        positionChildren: function (containerGuiItem: any) {
            let { cursorX, cursorY } = this.getInitialCursor(containerGuiItem);
            // coordinate system is 0, 0 in the top left
            //console.log(`initial cursor position for ${this.el.getAttribute("id")}: ${cursorX} ${cursorY} 0.01`)
            if (this.data.open) {
                if (this.data.flexDirection === 'row') {
                    cursorX += (this.data.menuItemMargin)
                }
                else {
                    cursorY += (this.data.menuItemMargin)
                }
                this.positionChildrenOpen({ containerGuiItem, cursorX, cursorY });
            }
            else {
                this.positionChildrenClosed({ containerGuiItem, cursorX, cursorY })
            }
        },
        getChildPositions: function ({ childElement, containerGuiItem, cursorX, cursorY }) {
            let childPositionX = 0;
            let childPositionY = 0;
            let childPositionZ = -0.01;
            let i = 0;
            let zStep = -.1;
            let childGuiItem = childElement.getAttribute("gui-item");
            if (childGuiItem) {
                if (this.data.selected !== i) {
                    childPositionZ = (i + 1) * zStep;
                }
                if (this.data.flexDirection == 'row') {
                    if (this.data.alignItems == 'center') {
                        childPositionY = 0; // child position is always 0 for center vertical alignment
                    } else if (this.data.alignItems == 'flexStart') {
                        childPositionY = containerGuiItem.height * 0.5 - childGuiItem.margin.x - childGuiItem.height;
                    } else if (this.data.alignItems == 'flexEnd') {
                        childPositionY = -containerGuiItem.height * 0.5 + childGuiItem.margin.z + childGuiItem.height;
                    }
                    childPositionX = -containerGuiItem.width * 0.5 + cursorX + childGuiItem.margin.w + childGuiItem.width * 0.5
                    cursorX = cursorX + childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                } else if (this.data.flexDirection == 'column') {
                    if (this.data.alignItems == 'center') {
                        childPositionX = 0; // child position is always 0 to center
                    } else if (this.data.alignItems == 'flexStart') {
                        childPositionX = -containerGuiItem.width * 0.5 + childGuiItem.margin.w + childGuiItem.width * 0.5;
                    } else if (this.data.alignItems == 'flexEnd') {
                        childPositionX = containerGuiItem.width * 0.5 - childGuiItem.margin.y - childGuiItem.width * 0.5;
                    }
                    childPositionY = containerGuiItem.height * 0.5 - cursorY - - childGuiItem.margin.x - childGuiItem.height * 0.5
                    cursorY = cursorY + childGuiItem.margin.x + childGuiItem.height + childGuiItem.margin.z;
                }
            }

            return {
                x: childPositionX,
                y: childPositionY,
                z: childPositionZ,
            }
        },
        positionChildrenClosed: function ({ containerGuiItem, cursorX, cursorY }) {
            // not that cursor positions are determined, loop through and lay out items

            let initialCursor = { x: cursorX, y: cursorY };
            let backZ = -.1;

            for (let i = 0; i < this.children.length; i++) {
                let childElement = this.children[i];
                // TODO: change this to call gedWidth() and setWidth() of component
                let zStep = -.02;
                let childPositionX = 0;
                let childPositionY = 0;
                let childPositionZ = -0.01;
                let childGuiItem = childElement.getAttribute("gui-item");
                childElement.setAttribute('enabled', false);

                // now get object position in aframe container cordinates (0, 0 is center)
                if (childGuiItem) {
                    if (this.data.selected !== i) {
                        childPositionZ = (i + 1) * zStep;
                    }
                    if (this.data.flexDirection == 'row') {
                        if (this.data.alignItems == 'center') {
                            childPositionY = 0; // child position is always 0 for center vertical alignment
                        } else if (this.data.alignItems == 'flexStart') {
                            childPositionY = containerGuiItem.height * 0.5 - childGuiItem.margin.x - childGuiItem.height;
                        } else if (this.data.alignItems == 'flexEnd') {
                            childPositionY = -containerGuiItem.height * 0.5 + childGuiItem.margin.z + childGuiItem.height;
                        }
                        childPositionX = -containerGuiItem.width * 0.5 + cursorX + childGuiItem.margin.w + childGuiItem.width * 0.5
                        cursorX = cursorX + childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                    } else if (this.data.flexDirection == 'column') {
                        if (this.data.alignItems == 'center') {
                            childPositionX = 0; // child position is always 0 to center
                        } else if (this.data.alignItems == 'flexStart') {
                            childPositionX = -containerGuiItem.width * 0.5 + childGuiItem.margin.w + childGuiItem.width * 0.5;
                        } else if (this.data.alignItems == 'flexEnd') {
                            childPositionX = containerGuiItem.width * 0.5 - childGuiItem.margin.y - childGuiItem.width * 0.5;
                        }
                        childPositionY = containerGuiItem.height * 0.5 - cursorY - - childGuiItem.margin.x - childGuiItem.height * 0.5
                        cursorY = cursorY + childGuiItem.margin.x + childGuiItem.height + childGuiItem.margin.z;
                    }
                    // let position_to = `${childPositionX} ${childPositionY} ${childPositionZ + backZ}`;
                    // if (this.data.selected === i) {
                    //     position_to = `${childPositionX} ${childPositionY} ${childPositionZ}`;
                    // }
                    if (i === 0) {
                        initialCursor.y = childPositionY;
                        initialCursor.x = childPositionX;
                    }
                    childElement.setAttribute('animation__position', {
                        property: 'position',
                        to: `${this.data.flexDirection !== 'row' ? childPositionX : 0} ${this.data.flexDirection == 'row' ? childPositionY : 0} ${((i + 1) * zStep) + backZ}`,
                        dur: this.data.dur || 1000,
                        easing: 'easeInOutQuad'
                    });
                    childElement.setAttribute('animation__scale', {
                        property: 'scale',
                        to: `.01 .01 .01`,
                        dur: this.data.dur || 1000,
                        easing: 'easeInOutQuad'
                    });
                    // childElement.setAttribute('geometry', `primitive: plane; height: ${childGuiItem.height}; width: ${childGuiItem.width};`)

                    var childFlexContainer = childElement.components['ui-menu-container']
                    if (childFlexContainer) {
                        childFlexContainer.setBackground();
                    }
                }
            }
        },
        positionChildrenOpen: function ({ containerGuiItem, cursorX, cursorY }) {
            // not that cursor positions are determined, loop through and lay out items
            let dir = this.data.menuDirection === 'up' ? 1 : -1;
            for (var i = 0; i < this.children.length; i++) {
                var childElement = this.children[i];
                // TODO: change this to call gedWidth() and setWidth() of component
                var childPositionX = 0;
                var childPositionY = 0;
                var childPositionZ = this.data.forwardStep;
                var childGuiItem = childElement.getAttribute("gui-item");
                childElement.setAttribute('enabled', true);
                // now get object position in aframe container cordinates (0, 0 is center)
                if (childGuiItem) {
                    if (this.data.flexDirection == 'row') {
                        if (this.data.alignItems == 'center') {
                            childPositionY = 0; // child position is always 0 for center vertical alignment
                        } else if (this.data.alignItems == 'flexStart') {
                            childPositionY = containerGuiItem.height * 0.5 - childGuiItem.margin.x - childGuiItem.height;
                        } else if (this.data.alignItems == 'flexEnd') {
                            childPositionY = -containerGuiItem.height * 0.5 + childGuiItem.margin.z + childGuiItem.height;
                        }
                        childPositionX = cursorX + childGuiItem.margin.w + childGuiItem.width * 0.5;
                        let changeX = childGuiItem.margin.w + childGuiItem.width + childGuiItem.margin.y;
                        changeX *= dir;
                        cursorX = cursorX + changeX;
                    } else if (this.data.flexDirection == 'column') {
                        if (this.data.alignItems == 'center') {
                            childPositionX = 0; // child position is always 0 to center
                        } else if (this.data.alignItems == 'flexStart') {
                            childPositionX = -containerGuiItem.width * 0.5 + childGuiItem.margin.w + childGuiItem.width * 0.5;
                        } else if (this.data.alignItems == 'flexEnd') {
                            childPositionX = containerGuiItem.width * 0.5 - childGuiItem.margin.y - childGuiItem.width * 0.5;
                        }
                        childPositionY = cursorY + childGuiItem.height * dir;
                        let changeY = childGuiItem.height + this.data.menuItemMargin;
                        changeY *= dir;
                        cursorY = cursorY + changeY;
                    }

                    childElement.setAttribute('animation__position', {
                        property: 'position',
                        to: `${childPositionX} ${childPositionY} ${childPositionZ}`,
                        dur: this.data.dur || 1000,
                        easing: 'easeInOutQuad'
                    });
                    childElement.setAttribute('animation__scale', {
                        property: 'scale',
                        to: `1 1 1`,
                        dur: this.data.dur || 1000,
                        easing: 'easeInOutQuad'
                    });

                    var childFlexContainer = childElement.components['ui-menu-container']
                    if (childFlexContainer) {
                        childFlexContainer.setBackground();
                    }
                }
            }
        },
        update: function (oldData) {
            if (this.data.open !== oldData?.open) {
                var containerGuiItem = this.el.getAttribute("gui-item");
                this.positionChildren(containerGuiItem);

                if (this.entryPanel) {
                    this.entryPanel.setAttribute('checked', this.data.open);
                    this.entryPanel.setAttribute('animation', {
                        property: 'position',
                        to: `${0} ${0} ${this.data.open ? .02 : 0}`,
                        dur: this.data.dur || 1000,
                        easing: this.data.easing || 'easeInOutQuad'
                    });
                }
            }
            if (this.data.text !== oldData?.text) {
                this.entryPanel.setAttribute('value', this.data.text)
            }
        },
        tick: function () { },
        remove: function () {
            if (this.cleanup)
                this.cleanup();
        },
        pause: function () { },
        play: function () { },
        getElementSize: function () { },
        setBackground: function () {
            if (this.data.opacity > 0) {
                console.log("panel position: " + JSON.stringify(this.el.getAttribute("position")));
                // var guiItem = this.el.getAttribute("gui-item");
                var panelBackground = document.createElement("a-entity");
                // panelBackground.setAttribute('rounded', `height: ${guiItem.height}; width: ${guiItem.width}; opacity: ${this.data.opacity}; color: ${this.data.panelColor}; radius:${this.data.panelRounded}; depthWrite:false; polygonOffset:true; polygonOffsetFactor: 2;`);
                //            panelBackground.setAttribute('geometry', `primitive: box; height: ${guiItem.height}; width: ${guiItem.width}; depth:0.025;`);
                console.log("about to set panel background color to: : " + this.data.panelColor);
                //            panelBackground.setAttribute('material', `shader: standard; depthTest: true; opacity: ${this.data.opacity}; color: ${this.data.panelColor};`);
                panelBackground.setAttribute('position', this.el.getAttribute("position").x + ' ' + this.el.getAttribute("position").y + ' ' + (this.el.getAttribute("position").z - 0.0125));
                panelBackground.setAttribute('rotation', this.el.getAttribute("rotation").x + ' ' + this.el.getAttribute("rotation").y + ' ' + this.el.getAttribute("rotation").z);
                this.el.parentNode.insertBefore(panelBackground, this.el);
            }

        },
        ...mixin,
        getWidth: function () {
            return parseFloat(`${this.data.menuItemWidth}`);
        },
        getHeight: function () {
            return parseFloat(`${this.data.menuItemHeight}`);
        },

    });

    AFRAME.registerPrimitive('frame-menu-container', {
        defaultComponents: {
            'gui-item': { type: 'menu-container' },
            'ui-menu-container': {}
        },
        mappings: {
            'width': 'gui-item.width',
            'height': 'gui-item.height',
            'margin': 'gui-item.margin',
            'value': 'ui-menu-container.value',
            'text-value': 'ui-menu-container.text',
            'selected': 'ui-menu-container.selected',
            'open': 'ui-menu-container.open',
            'flex-direction': 'ui-menu-container.flexDirection',
            'justify-content': 'ui-menu-container.justifyContent',
            'dur': 'ui-menu-container.dur',
            'easing': 'ui-menu-container.easing',
            'align-items': 'ui-menu-container.alignItems',
            'item-padding': 'ui-menu-container.itemPadding',
            'menu-item-width': 'ui-menu-container.menuItemWidth',
            'menu-item-height': 'ui-menu-container.menuItemHeight',
            'forward-step': 'ui-menu-container.forwardStep',
            'menu-item-margin': 'ui-menu-container.menuItemMargin',
            'menu-direction': 'ui-menu-container.menuDirection',
            'opacity': 'ui-menu-container.opacity',
            'is-top-container': 'ui-menu-container.isTopContainer',
            'panel-color': 'ui-menu-container.panelColor',
            'panel-rounded': 'ui-menu-container.panelRounded',
            'font-family': 'ui-menu-container.styles.fontFamily',
            'font-color': 'ui-menu-container.styles.fontColor',
            'border-color': 'ui-menu-container.styles.borderColor',
            'background-color': 'ui-menu-container.styles.backgroundColor',
            'hover-color': 'ui-menu-container.styles.hoverColor',
            'active-color': 'ui-menu-container.styles.activeColor',
            'handle-color': 'ui-menu-container.styles.handleColor',
        }
    });

}