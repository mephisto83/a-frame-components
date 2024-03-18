import { PAINTER_CONSTANTS } from '../constants';
import { AFRAME } from '../systems/brush';
import { INTERACTABLES, UIStates, getUISystem } from '../systems/ui';
import { Utils, clamp, findGrayByPercentage, getRgbFromPosition, hexToHsv, hsb2rgb, limitToUnitCircle, raiseCustomEvent, rgb2hsv, rgbToHex, setConsoleText, uuidv4, uvToColorHex, uvToUnitCircle } from '../util';
const THREE: any = (window as any).THREE;
/* globals AFRAME THREE */
export default function () {
    if (false)
        AFRAME.registerComponent('interaction-panel', {
            schema: {
                config: { type: 'string', default: 'colorwheel' },
                cursor: { type: 'string', default: 'square' },
                brightness: {
                    default: 1.0, max: 1.0, min: 0.0,
                    // selector_model: { type: 'string', default: 'square' },
                    // selector_model_material: { type: 'string', default: 'square_material' },
                    // surface_model: { type: 'string', default: '' },
                    // surface_model_object: { type: 'string', default: '' },
                    // surface_material_function: { type: 'string', default: '' },
                },
                opacity: { default: 1 }
            },
            update: function () {

            },

            init: function () {
                var el = this.el;
                var uiEl = this.uiEl = document.createElement('a-entity');
                var system = this.el.sceneEl.systems.ui; // Access by system name
                this.system = system;
                this.objects = {};
                this.raycasters = {}
                this.raycastStates = {}
                this.bindMethods();
                el.addEventListener('model-loaded', this.onModelLoaded);

                // UI entity setup
                (uiEl as any).setAttribute('material', {
                    color: '#ffffff',
                    flatShading: true,
                    shader: 'flat',
                    transparent: true,
                    fog: false,
                    src: '#uinormal'
                });
                // this.el.setAttribute('obj-model', 'obj: #logoobj; mtl: #logomtl');
                uiEl.setAttribute('obj-model', `obj:#combined_shapes; mtl:#combined_shapes_material`);
                uiEl.setAttribute('position', '0 0 0');
                uiEl.setAttribute('scale', '1 1 1');
                (uiEl as any).setAttribute('visible', true);
                el.appendChild(uiEl);
                this.menuEls = this.uiEl.object3D.children;
            },
            bindMethods: function () {
                this.onModelLoaded = this.onModelLoaded.bind(this);
                this.handleColorWheelTouched = this.handleColorWheelTouched.bind(this);
                this.handleCursorSize = this.handleCursorSize.bind(this)
                this.handleBrightnessTouched = this.handleBrightnessTouched.bind(this);
            },
            onModelLoaded: function (evt) {
                var uiEl = this.uiEl;
                var model = uiEl.getObject3D('mesh');
                model = evt.detail.model;
                if (evt.detail.format !== 'obj') { return; }
                this.objects.squareCursor = model.getObjectByName('Square');
                this.objects.circleSurface = model.getObjectByName('Circle');
                this.objects.planeSurface = model.getObjectByName('Brightness');

                this.objects.circleSurface.geometry.computeBoundingSphere();
                switch (this.data.cursor) {
                    case 'square':
                        this.cursor = this.objects.squareCursor
                        break;
                }
                this.cursor.position.set(0, -1, 0)
                this.circleSurfaceSize = this.objects.circleSurface.geometry.boundingSphere.radius;
                this.objects.circleSurface.position.set(0, 0, 0)
                this.buildSurface()
            },
            tick: function () {
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
                if (this?.colorwheel?.material?.uniforms) {
                    if (this.brightness !== this.system.getCurrentBrightnessState()) {
                        this.brightness = this.system.getCurrentBrightnessState();
                        this.colorwheel.material.uniforms['brightness'].value = this.brightness;

                        let hsv = hexToHsv(this.system.getCurrentColorState() || '#ffffff')
                        if (hsv) {
                            let color = rgbToHex(hsb2rgb([hsv.h, hsv.s, this.brightness]));
                            this.updateColorUI(color);
                            if (this.currentColor) {
                                this.colorEl.setAttribute('material', 'color', this.currentColor);
                                this.system.setCurrentColorState(this.currentColor)
                            }
                        }
                    }
                }
            },
            handleBrightnessTouched: function (args) {
                if (this.system) {
                    const { uv, x, y, raycaster, entity } = args;
                    let raycastid = raycaster?.components?.raycaster?.el?.id;
                    if (this.system.getButtonState(raycastid, 'trigger') === 'down') {
                        this.setRaycastStates(raycastid, 'pressed', this.system.getButtonState(raycastid, 'trigger') === 'down')
                        let brightness = 1 - uv.x;
                        // let color = getRgbFromPosition(uv.y - .5, (1 - brightness) - .5);
                        let color = findGrayByPercentage(brightness)
                        var colorRGB = new THREE.Color(color);

                        this.brightness = brightness;
                        this.updateColorUI(color)//, ((1 - uv.y) - .5) * this.circleSurfaceSize * 2, ((1 - brightness) - .5) * this.circleSurfaceSize * 2
                        this.textEntity.setAttribute('value', `${Math.round(100 * (1 - x))}%`);
                        this.colorEl.setAttribute('material', 'color', this.currentColor);
                        this.hsv = rgb2hsv(colorRGB.r, colorRGB.g, colorRGB.b);
                        if (this.objects?.hueWheel?.material) {
                            this.objects.hueWheel.material.uniforms['brightness'].value = this.hsv.v;
                        }
                    }
                    else {
                        if (this.getRaycastState(raycastid, 'pressed')) {
                            this.setRaycastStates(raycastid, 'pressed', this.system.getButtonState(raycastid, 'trigger') === 'down')
                            // clicked
                            if (this.currentColor) {
                                this.colorEl.setAttribute('material', 'color', this.currentColor);
                                this.system.setCurrentBrightnessState(this.brightness)
                                if (this.textEntity) {
                                    this.textEntity.setAttribute('value', `${Math.round(100 * (1 - x))}%`);
                                }
                            }
                        }
                    }
                }
            },
            handleColorWheelTouched: function (args) {
                if (this.system) {
                    let me = this;
                    const { uv, x, y, raycaster, entity } = args;
                    let raycastid = raycaster?.components?.raycaster?.el?.id;
                    if (me.mouseClicked) {
                        me.mouseClicked = false;
                        let brightness = this.system.getCurrentBrightnessState() || 1
                        let color = uvToColorHex(uv.x, (uv.y), brightness);
                        var colorRGB = new THREE.Color(color);
                        this.hsv = rgb2hsv(colorRGB.r, colorRGB.g, colorRGB.b);
                        this.updateColorUI(color)
                        // clicked
                        if (this.currentColor) {
                            this.colorEl.setAttribute('material', 'color', this.currentColor);
                            this.system.setCurrentColorState(this.currentColor)
                        }
                    }
                    if (this.system.getButtonState(raycastid, 'trigger') === 'down') {
                        this.setRaycastStates(raycastid, 'pressed', this.system.getButtonState(raycastid, 'trigger') === 'down')
                        // let color = getRgbFromPosition(uv.y - .5, (1 - uv.x) - .5);
                        let brightness = this.system.getCurrentBrightnessState() || 1
                        let color = uvToColorHex(uv.x, (uv.y), brightness);
                        var colorRGB = new THREE.Color(color);
                        this.hsv = rgb2hsv(colorRGB.r, colorRGB.g, colorRGB.b);
                        if (this.objects?.hueWheel?.material) {
                            this.objects.hueWheel.material.uniforms['brightness'].value = this.hsv.v;
                        }
                        this.updateColorUI(color)//, ((1 - uv.y) - .5) * this.circleSurfaceSize * 2, ((1 - uv.x) - .5) * this.circleSurfaceSize * 2
                    }
                    else {
                        if (this.getRaycastState(raycastid, 'pressed')) {
                            if (!me.mousedown) {
                                this.setRaycastStates(raycastid, 'pressed', this.system.getButtonState(raycastid, 'trigger') === 'down')
                            }
                            // clicked
                            if (this.currentColor) {
                                this.colorEl.setAttribute('material', 'color', this.currentColor);
                                this.system.setCurrentColorState(this.currentColor)
                            }
                        }
                    }
                }
            },
            handleCursorSize: function (args) {
                if (this.system) {
                    const { uv, x, y, raycaster, entity } = args;
                    let raycastid = raycaster?.components?.raycaster?.el?.id;
                    if (this.system.getButtonState(raycastid, 'trigger') === 'down') {
                        this.system.setCursorSize(uv.x);
                        if (this.textEntity) {
                            this.textEntity.setAttribute('value', `${Math.round(100 * x)}%`);
                        }
                    }
                }
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
            buildSurface: function () {
                let me = this;
                this.surfaceEl = null;
                if (this.objects.circleSurface) {
                    // Create an A-Frame entity to wrap the Three.js mesh
                    let circleSurfaceEntity: any = document.createElement('a-entity');
                    circleSurfaceEntity.classList.add('raycastable');
                    // Add the Three.js mesh to the A-Frame entity
                    circleSurfaceEntity.setObject3D('mesh', this.objects.circleSurface);
                    circleSurfaceEntity.setAttribute('gui-interactable', {});
                    // circleSurfaceEntity.setAttribute('rotation', { x: 0, y: 90, z: 45 });
                    this.el.appendChild(circleSurfaceEntity);
                    switch (this.data.config) {
                        case 'colorwheel': {
                            this.hsv = { h: 0.0, s: 0.0, v: 1.0 };
                            this.colorWheelMaterial(this.objects.circleSurface);
                            this.colorwheel = this.objects.circleSurface;

                            let planeEntity: any = document.createElement('a-plane');
                            planeEntity.setAttribute('material', 'color', `#ffffff`);
                            this.colorEl = planeEntity;
                            circleSurfaceEntity.appendChild(planeEntity);
                            planeEntity.setAttribute('position', '0 .1 -0.548907');
                            planeEntity.setAttribute('scale', '.2 .2 .2');
                            planeEntity.setAttribute('gui-interactable', {});
                            planeEntity.setAttribute('rotation', '-45 0 0');
                            circleSurfaceEntity.addEventListener('click', () => {
                                me.mouseClicked = true;
                            })


                            this.updateColorUI('#ffffff');

                            this.setupRayListener(circleSurfaceEntity, 'colorwheel', this.handleColorWheelTouched)
                        }
                            break;
                        default:
                            circleSurfaceEntity.setAttribute('visible', false);
                            break;
                    }
                }
                if (this.objects.planeSurface) {
                    let planeSurfaceEntity: any = document.createElement('a-entity');
                    planeSurfaceEntity.classList.add('raycastable');
                    // Add the Three.js mesh to the A-Frame entity
                    planeSurfaceEntity.setObject3D('mesh', this.objects.planeSurface);
                    planeSurfaceEntity.setAttribute('gui-interactable', {})
                    this.el.appendChild(planeSurfaceEntity);

                    switch (this.data.config) {
                        case 'colorbrightness':
                            this.brightnessWheelMaterial(this.objects.planeSurface, '#ffffff', '#000000', true);
                            this.brightnessPlane = this.objects.planeSurface;
                            {
                                let planeEntity: any = document.createElement('a-plane');
                                planeEntity.setAttribute('material', 'color', `#ffffff`);
                                this.colorEl = planeEntity;
                                planeSurfaceEntity.appendChild(planeEntity);
                                planeEntity.setAttribute('position', '0.608083 .1 -0.548907');
                                planeEntity.setAttribute('scale', '.15 .15 .15');
                                planeEntity.setAttribute('rotation', '-45 0 0');
                                let textEntity = document.createElement('a-text');
                                textEntity.setAttribute('color', '#000');
                                textEntity.setAttribute('scale', '1.9 1.9 1.9');
                                textEntity.setAttribute('align', 'center');
                                textEntity.setAttribute('value', `${Math.round(this.system.getCurrentBrightnessState() * 100)}%`);
                                planeEntity.appendChild(textEntity);

                                let explanationText = document.createElement('a-text');
                                explanationText.setAttribute('color', '#fff');
                                explanationText.setAttribute('align', 'center');
                                explanationText.setAttribute('scale', '.4 .4 .4');
                                explanationText.setAttribute('rotation', '-90 -90 0');
                                explanationText.setAttribute('position', '0.608083 .1 0.548907');
                                explanationText.setAttribute('value', `Brightness`);

                                this.el.appendChild(explanationText);
                                this.textEntity = textEntity;
                            }
                            this.updateColorUI('#ffffff');
                            this.setupRayListener(planeSurfaceEntity, 'brightness', this.handleBrightnessTouched)
                            break;
                        case 'cursorsize': {

                            this.brightnessWheelMaterial(this.objects.planeSurface, '#ffffff', '#000000', true);
                            this.brightnessPlane = this.objects.planeSurface;
                            {
                                let planeEntity: any = document.createElement('a-plane');
                                planeEntity.setAttribute('material', 'color', `#ffffff`);
                                this.colorEl = planeEntity;
                                planeSurfaceEntity.appendChild(planeEntity);
                                planeEntity.setAttribute('position', '0.608083 .1 -0.548907');
                                planeEntity.setAttribute('scale', '.15 .15 .15');
                                planeEntity.setAttribute('rotation', '-45 0 0');
                                this.updateColorUI('#ffffff');
                                //  <a-text id="prompt-function" width="2" wrapCount="130" class="prompt-function-console" value="Prompts:" color="#0FFF11"></a-text>
                                let textEntity = document.createElement('a-text');
                                textEntity.setAttribute('color', '#000');
                                textEntity.setAttribute('align', 'center');
                                textEntity.setAttribute('scale', '1.9 1.9 1.9');
                                textEntity.setAttribute('value', `${Math.round(this.system.getCursorSize() * 100)}%`);
                                planeEntity.appendChild(textEntity);
                                let explanationText = document.createElement('a-text');
                                explanationText.setAttribute('color', '#fff');
                                explanationText.setAttribute('align', 'center');
                                explanationText.setAttribute('scale', '.4 .4 .4');
                                explanationText.setAttribute('rotation', '-90 -90 0');
                                explanationText.setAttribute('position', '0.608083 .1 0.548907');
                                explanationText.setAttribute('value', `Brush Size`);
                                this.el.appendChild(explanationText);

                                this.textEntity = textEntity;
                                this.setupRayListener(planeSurfaceEntity, 'cursorsize', this.handleCursorSize)
                            }
                        }
                            break;
                        default:
                            planeSurfaceEntity.setAttribute('visible', false)
                            break;
                    }
                }
            },
            setupRayListener: function (entity, raycastKey, handler) {
                let me = this;
                me.raycasters = me.raycasters || {}
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
            updateColorUI: function (color) {
                // Update color wheel
                this.currentColor = color
            },
            brightnessWheelMaterial: function (brightness, color1, color2, isHorizontal) {
                let vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;

                let fragmentShader = `
                varying vec2 vUv;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform bool isHorizontal;
        
                void main() {
                    vec3 color = mix(color1, color2, isHorizontal ? vUv.x : vUv.y);
                    gl_FragColor = vec4(color, 1.0);
                }
            `;

                let material = new THREE.ShaderMaterial({
                    uniforms: {
                        color1: { type: 'c', value: new THREE.Color(color1) },
                        color2: { type: 'c', value: new THREE.Color(color2) },
                        isHorizontal: { type: 'bool', value: isHorizontal }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });
                brightness.material = material;
            },
            colorWheelMaterial: function (colorWheel) {
                let vertexShader = '\
    varying vec2 vUv;\
    void main() {\
      vUv = uv;\
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\
      gl_Position = projectionMatrix * mvPosition;\
    }\
    ';

                let fragmentShader = '\
    #define M_PI2 6.28318530718\n \
    uniform float brightness;\
    varying vec2 vUv;\
    vec3 hsb2rgb(in vec3 c){\
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, \
                         0.0, \
                         1.0 );\
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);\
        return c.z * mix( vec3(1.0), rgb, c.y);\
    }\
    \
    void main() {\
      vec2 toCenter = vec2(0.5) - vUv;\
      float angle = atan(toCenter.y, toCenter.x);\
      float radius = length(toCenter) * 2.0;\
      vec3 color = hsb2rgb(vec3((angle / M_PI2) + 0.5, radius, brightness));\
      gl_FragColor = vec4(color, 1.0);\
    }\
    ';

                let material = new THREE.ShaderMaterial({
                    uniforms: { brightness: { type: 'f', value: this.hsv.v } },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });
                colorWheel.material = material;
            },

        })
}