import mixin from '../../gui/components/mixin';
import { PAINTER_CONSTANTS } from '../constants';
import { AFRAME } from '../systems/brush';
import { GrabAndDropEvents } from '../systems/grabanddrop';
import { drawTextureOnCanvas, raiseCustomEvent } from '../util';

const THREE = (window as any).THREE;
/* globals AFRAME THREE */
export default function () {
    AFRAME.registerComponent('canvasimage', {
        schema: {
            category: { type: 'string' },
            url: { type: 'string' },
            height: { type: 'number', default: 1 }, // Provide a default value for height
            width: { type: 'number', default: 1 } // Provide a default value for width
        },
        ...mixin,
        init: function () {
            let me = this;
            let plane: any = document.createElement('a-plane');
            plane.setAttribute('height', "1")
            plane.setAttribute('width', "1")
            plane.setAttribute('position', "0 0 -1")
            plane.setAttribute('draganddropzone', {});
            me.plane = plane;
            me.el.appendChild(plane);
            this.updateElementSize(this, this.el)
            this.loadImage();
            me.el.addEventListener(GrabAndDropEvents.DROPPED_GRABBED_DATA, async (evt) => {
                const { data, category } = evt.detail;
                if (me.data.category === category) {
                    if (data?.url) {
                        me.el.setAttribute('url', data?.url);
                    }
                }

            })
        },
        update: function (oldData) {
            // Only update if url has changed
            if ((oldData?.url && oldData.url !== this.data.url) ||
                this.data.height !== oldData.height) {
                this.loadImage();
            }
        },
        getWidth: function () {
            return parseFloat(`${this?.size?.width || this.data.width || 0}`);
        },
        getHeight: function () {
            return parseFloat(`${this?.size?.height || this.data.height || 0}`);
        },
        loadImage: function () {
            let me = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var image = new Image();
            image.crossOrigin = "anonymous"; // Handle cross-origin images
            image.onload = async () => {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                context.drawImage(image, 0, 0);
                var aspectRatio = image.naturalWidth / image.naturalHeight;

                var texture = new THREE.Texture(canvas);
                let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                let height = this.data.height;
                let width = this.data.height * aspectRatio;
                
                this.width = width;

                let mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(width, height),
                    material
                );
                me.size = {
                    height,
                    width
                }
                // Create an A-Frame entity to wrap the Three.js mesh
                let layerDisplayEntity: any = document.createElement('a-entity');
                layerDisplayEntity.setObject3D('mesh', mesh);

                if (me.plane) {
                    me.plane.parentNode.removeChild(me.plane);
                }
                me.plane = layerDisplayEntity;
                me.el.appendChild(layerDisplayEntity);
                await drawTextureOnCanvas(canvas, canvas.getContext('2d'), me.data?.url);
                texture.needsUpdate = true;
                raiseCustomEvent(PAINTER_CONSTANTS.CANVAS_IMAGE_CHANGED, { url: me.data.url, canvas });
                me.el.emit(PAINTER_CONSTANTS.CANVAS_IMAGE_UPDATED, { url: me.data.url, canvas });
                me.updateElementSize(this, this.el);

            };
            image.src = this.data.url;
        }
    });

    AFRAME.registerPrimitive('frame-canvas-image', {
        defaultComponents: {
            'canvasimage': {}
        },
        mappings: {
            url: 'canvasimage.url',
            height: 'canvasimage.height',
            width: 'canvasimage.width',
            category: 'canvasimage.category'
        }
    });
}