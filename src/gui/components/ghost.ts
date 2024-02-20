import { AFRAME } from "../../painter/root";
import { GrabAndDropEvents, GrabOutDetails, GrabOverDetails, calculateEndPoint, customEventListener, getInputDevice, lerp3, setInputDevice, } from "../../painter/systems/grabanddrop";
import { raiseCustomEvent } from "../../painter/util";
export default function () {
    const THREE: any = (window as any).THREE;
    AFRAME.registerComponent('grabanddropzone', {
        schema: {
        },
        init: function () {
            let me = this;
            let el = this.el;

            el.setAttribute('gui-interactable', {});
            customEventListener(GrabAndDropEvents.GRABBING_START, (evt: any) => {
                me.grabbing = true;
                const { category, deviceId } = evt;
                let { size } = getEntityBoundsAndSize(el);
                if (me?.imageCube?.parentNode) {
                    me.imageCube.parentNode.removeChild(me.imageCube)
                }
                let imageCube: any = document.createElement('a-image-cube');
                imageCube.setAttribute('gui-interactable', {})
                imageCube.addEventListener('raycaster-intersected', function (event) {
                    let device = setInputDevice(event)
                    if (device?.id === deviceId) {
                        let details: GrabOverDetails = {
                            component: me,
                            deviceId: device.id
                        }
                        me.deviceId = device.id;
                        raiseCustomEvent(GrabAndDropEvents.GRAB_OVER, details)
                    }
                });
                imageCube.addEventListener('raycaster-intersected-cleared', function (event) {
                    let device = setInputDevice(event)
                    if (device?.id === deviceId) {
                        let details: GrabOutDetails = {
                            component: me,
                            deviceId: device.id
                        }
                        delete me.deviceId;
                        raiseCustomEvent(GrabAndDropEvents.GRAB_OUT, details)
                    }
                });

                let skin = 'assets/images/selection.png';
                imageCube.setAttribute('src', `url(${skin})`)
                imageCube.setAttribute('size', Math.min(size.x, size.y, size.z));
                let entity: any = document.createElement('a-entity');
                entity.appendChild(imageCube);
                me.el.appendChild(entity);
                me.imageCube = entity;
                // Listen for animation end to toggle
                entity.addEventListener('animationcomplete', function () {
                    if (entity.getAttribute('scale').x === 1) {
                        // If the entity has scaled up, scale it down
                        setScaleDownAnimation(entity);
                    } else {
                        // If the entity has scaled down, scale it up
                        setScaleUpAnimation(entity);
                    }
                });
                setScaleUpAnimation(entity);
            });

            customEventListener(GrabAndDropEvents.GRABBING_ENDED, (evt: any) => {
                me.grabbing = false;
                if (me.imageCube && (evt.deviceId === me.deviceId || !me.deviceId)) {
                    me.imageCube.parentNode.removeChild(me.imageCube)
                    me.imageCube = null;
                }
            });
        }
    })
    AFRAME.registerComponent('ghost', {
        schema: {
            die: { type: 'boolean', default: false },
            alive: { type: 'boolean', default: false },
            device: { type: 'string', default: '' }
        },
        init: function () {
            let me = this;
            var el = this.el;
            el.addEventListener(GrabAndDropEvents.GRAB_TARGET_CHANGE, async (evt) => {
                const { component, deviceId } = evt.detail;
                if (me.data.device === deviceId) {
                    me.targetComponent = component;
                }
            });
        },
        tick: function () {
            let me = this;
            let nextpos = null;
            if (this.data.die) {
                return;
            }
            if (me.targetComponent) {
                var worldPosition = new THREE.Vector3();
                me.targetComponent.el.object3D.getWorldPosition(worldPosition);
                me.targetPoint = worldPosition
            }
            else if (me.targetDevice) {
                let ray = me.targetDevice.getRay();
                if (ray?.ray) {
                    let { origin, direction } = ray.ray;
                    me.targetPoint = calculateEndPoint(origin, direction, 2);
                }
            }

            if (me.targetPoint) {
                var worldPosition = new THREE.Vector3();
                me.el.object3D.getWorldPosition(worldPosition);
                nextpos = lerp3(worldPosition, me.targetPoint, .07);
                me.el.setAttribute('position', `${nextpos.x} ${nextpos.y} ${nextpos.z}`);
            }
        },
        appendChild: function (el) {
            // Append child entity or element
            this.el.appendChild(el);
        },
        update: function (oldData) {
            if (this.data.die) {
                this.el.parentNode.removeChild(this.el);
            }
            if (this.data.device !== oldData.device) {
                let inputDevice = getInputDevice(this.data.device);
                if (inputDevice) {
                    console.log(inputDevice);
                    this.targetDevice = inputDevice;
                }
            }
        }
    });

    AFRAME.registerPrimitive('a-ghost', {
        defaultComponents: {
            'ghost': {}
        },
        mappings: {
            //gui item general
            'die': 'ghost.die',
            'alive': 'ghost.alive',
            'device': 'ghost.device',
            // 'height': 'gui-item.height',
            // 'margin': 'gui-item.margin',
            // //gui timer specific
            // 'count-down': 'gui-circle-timer.countDown',
            // 'font-size': 'gui-circle-timer.fontSize',
            // 'font-family': 'gui-circle-timer.fontFamily',
            // 'font-color': 'gui-circle-timer.fontColor',
            // 'border-color': 'gui-circle-timer.borderColor',
            // 'background-color': 'gui-circle-timer.backgroundColor',
            // 'active-color': 'gui-circle-timer.activeColor',
            // 'callback': 'gui-interactable.clickAction',
        }
    });
    function getEntityBoundsAndSize(entity) {
        // Ensure the entity is a valid A-Frame element
        if (!entity.object3D) {
            console.error('Invalid entity provided');
            return null;
        }

        // Create a new Box3 object, which represents the bounding box
        var boundingBox = new THREE.Box3().setFromObject(entity.object3D);

        // The size can be obtained from the bounding box
        var size = new THREE.Vector3();
        boundingBox.getSize(size);

        return {
            boundingBox: boundingBox,
            size: size
        };
    }
    // Function to set scaling up animation
    function setScaleUpAnimation(entity) {
        entity.setAttribute('animation', {
            property: 'scale',
            to: { x: 1.5, y: 1.5, z: 1.5 },
            dur: 1000,
        });
    }

    // Function to set scaling down animation
    function setScaleDownAnimation(entity) {
        entity.setAttribute('animation', {
            property: 'scale',
            to: { x: 1, y: 1, z: 1 },
            dur: 1000,
        });
    }
}
