import { uuidv4 } from "../util";

export default {
    onInit: function () {
        this.raycastStates = {};
        this.raycasters = {};
    },
    onTick: function () {
        for (let raycastKey in this.raycasters) {
            if (this.raycasters[raycastKey]) {
                const { raycaster, entity, handler } = this.raycasters[raycastKey];
                if (raycaster?.components?.raycaster && entity) {
                    let intersection = raycaster.components.raycaster.getIntersection(entity);
                    if (intersection?.uv) {
                        var uv = intersection.uv;
                        var x = uv.x;
                        var y = (1 - uv.y); // Invert y as canvas coordinates are from top to bottom
                        // Emit a custom event with x and y coordinates
                        handler({ uv, x, y, raycaster, entity });
                        // You can now use x and y to draw on the canvas or perform other actions
                    }
                }
            }
        }
    },
    setupRayListener: function (entity, raycastKey, handler) {
        let me = this;
        me.raycasters = me.raycasters || {}
        me.raycastersIntersecting = false;
        entity.addEventListener('raycaster-intersected', evt => {
            evt.detail.el.$id = evt.detail.el.$id || uuidv4();
            me.raycastersIntersecting = true;
            me.raycasters[raycastKey + evt.detail.el.$id] = {
                raycaster: evt.detail.el,
                entity: entity,
                handler
            };
        });
        entity.addEventListener('raycaster-intersected-cleared', evt => {
            delete me.raycasters[raycastKey + evt.detail.el.$id];
            me.raycastersIntersecting = false;
            this.clearRaycastState(evt?.detail?.el?.$id)
        });
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
}