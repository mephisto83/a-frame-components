import { calculatePositionsAndContainerSize } from "../../util";
/* globals AFRAME THREE */
export default function () {
    const THREE: any = (window as any).THREE;
    const AFRAME: any = (window as any).AFRAME || {}
    AFRAME.registerComponent('dynamic-container', {
        schema: {
            width: { type: 'number', default: 0 },
            height: { type: 'number', default: 0 },
            alignment: { type: 'string', default: 'flexStart' }, // flexStart, flexEnd, center
            justifyContent: { type: 'string', default: 'flexStart' }, // flexStart, flexEnd, center
            direction: { type: 'string', default: 'horizontal' }, // vertical, horizontal
            margin: { type: 'string', default: '0 0 0 0' } // top right bottom left
        },

        init: function () {
            let me = this;
            this.margin = this.parseMargin(this.data.margin);
            this.children = Array.from(this.el.children);
            this.el.addEventListener('size-update', (evt: any) => {
                me.calculateAndApplyPositions();
                evt.preventDefault();
            })
            this.calculateAndApplyPositions();
            this.observer = new MutationObserver(this.onChildrenChanged.bind(this));
            this.observer.observe(this.el, { childList: true });
        },
        update: function () {
            this.calculateAndApplyPositions();
        },
        parseMargin: function (marginStr: any) {
            const margins = marginStr.split(' ').map(Number);
            return {
                top: margins[0],
                right: margins[1],
                bottom: margins[2],
                left: margins[3],
            };
        },
        calculateAndApplyPositions: function () {
            let me = this;
            const items = Array.from(this.el.children).map((child: any) => {
                const newWidth = child.getWidth ? child.getWidth().toString() : (child.getAttribute('width') || '0');
                const newHeight = child.getHeight ? child.getHeight().toString() : (child.getAttribute('height') || '0');

                return {
                    width: parseFloat(newWidth) || 0,
                    height: parseFloat(newHeight) || 0,
                };
            });

            const { positions, containerSize } = calculatePositionsAndContainerSize(items, this.data.alignment, this.data.justifyContent, this.data.direction, this.margin);
            this.data.width = containerSize.width;
            this.data.height = containerSize.height;
            this.updateElementSize(me, me.el);
            positions.forEach((position, index) => {
                const child = this.el.children[index];
                // Adjust the position based on the calculated bounding box
                child.object3D.position.set(position.x, position.y, 0);
            });
        },

        expandBoundingBoxByObject: function (bbox: any, object3D: any) {
            let me = this;
            if (object3D) {
                object3D.traverse((child: any) => {
                    if (child?.el?.object3D) {
                        const childBBox = new THREE.Box3().setFromObject(child?.el?.object3D);
                        // childBBox.applyMatrix4(child.el.object3D.matrixWorld);
                        bbox.union(childBBox);
                    }
                    Array.from(child.children).map((child: any) => {
                        me.expandBoundingBoxByObject(bbox, child.object3D);
                    });
                });
            }
        },

        onChildrenChanged: function () {
            this.calculateAndApplyPositions();
        },

        getWidth: function () {
            return parseFloat(`${this.data.width}`);
        },
        getHeight: function () {
            return parseFloat(`${this.data.height}`);
        },
        updateElementSize: function updateElementSize(container: any, el: any) {
            let change = false;

            const currentWidth = el.getAttribute('width');
            const newWidth = container.getWidth().toString();
            if (currentWidth !== newWidth) {
                el.setAttribute('width', newWidth);
                change = true;
            }

            const currentHeight = el.getAttribute('height');
            const newHeight = container.getHeight().toString();
            if (currentHeight !== newHeight) {
                el.setAttribute('height', newHeight);
                change = true;
            }

            // Emit event only if there was any change
            if (change) {
                el.emit('size-update', {
                    width: newWidth,
                    height: newHeight,
                });
            }
        },
        remove: function () {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    });
    AFRAME.registerPrimitive('a-container', {
        defaultComponents: {
            'dynamic-container': {}
        },
        mappings: {
            //gui item general
            alignment: 'dynamic-container.alignment', // flexStart, flexEnd, center
            direction: 'dynamic-container.direction', // vertical, horizontal
            'justify-content': 'dynamic-container.justifyContent',// flexStart, flexEnd, center
            margin: 'dynamic-container.margin',// top right bottom left
        }
    });
}