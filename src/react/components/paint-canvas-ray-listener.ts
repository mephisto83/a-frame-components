import { AFRAME } from '../systems/brush';
import { INTERACTABLES } from '../systems/ui';
import { uuidv4 } from '../util';
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('raycaster-listener', {
        schema: {
            pressed: { type: 'boolean' }
        },
        init: function () {
            var system = this.el.sceneEl.systems.ui; // Access by system name
            this.system = system;
            this.raycasters = {}
            this.raycastStates = {};
            this.handleTouched = this.handleTouched.bind(this);
            // Use events to figure out what raycaster is listening so we don't have to
            // hardcode the raycaster.
            this.el.addEventListener('raycaster-intersected', evt => {
                this.raycaster = evt.detail.el;
            });
            this.el.addEventListener('raycaster-intersected-cleared', evt => {
                this.raycaster = null;
            });
            this.setupRayListener(this.el, 'color', this.handleTouched)
            var canvas: any = document.querySelector('.paint-canvas'); // Select your canvas
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;
            var canvasEl: any = document.querySelector('[paint-canvas]'); // Select your canvas
            this.canvasEl = canvasEl;
        },
        clearRaycastState: function (id) {
            delete this.raycastStates?.[id]
        },
        getRaycastState: function (id, key) {
            return this.raycastStates?.[id]?.[key]
        },
        setRaycastStates: function (id, key, value) {
            this.raycastStates[id] = this.raycastStates[id] || {};
            this.raycastStates[id][key] = value;
        },
        setupRayListener: function (entity, raycastKey, handler) {
            let me = this;
            entity.addEventListener('raycaster-intersected', evt => {
                evt.detail.el.$id = evt.detail.el.$id || uuidv4();
                me.raycasters[raycastKey + evt.detail.el.$id] = {
                    raycaster: evt.detail.el,
                    entity: entity,
                    handler
                };
            });
            entity.addEventListener('raycaster-intersected-cleared', evt => {
                delete me.raycasters[raycastKey + evt.detail.el.$id];
                this.clearRaycastState(evt?.detail?.el?.$id)
            });
        },
        handleTouched: function (args) {
            const { x, y } = args;
            var touchEvent = new CustomEvent('canvas-touched', {
                detail: {
                    x,
                    y,
                }
            });
            this.canvasEl.dispatchEvent(touchEvent);
        },
        tick: function () {
            for (let raycastKey in this.raycasters) {
                if (this.raycasters[raycastKey]) {
                    const { raycaster, entity, handler } = this.raycasters[raycastKey];
                    let raycastid = raycaster?.components?.raycaster?.el?.id;
                    if (this.system.getButtonState(raycastid, 'trigger') === 'down') {
                        if (raycaster?.components?.raycaster && entity) {
                            let intersection = raycaster.components.raycaster.getIntersection(entity);
                            if (intersection?.uv) {
                                var uv = intersection.uv;
                                var x = uv.x * this.canvasWidth;
                                var y = (1 - uv.y) * this.canvasHeight;  // Invert y as canvas coordinates are from top to bottom

                                // Emit a custom event with x and y coordinates
                                handler({ uv, x, y, raycaster, entity });
                                // You can now use x and y to draw on the canvas or perform other actions
                            }
                        }
                    }
                }
            }
        }
    });
}