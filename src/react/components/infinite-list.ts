import { AFRAME } from '../systems/brush';
import { uuidv4 } from '../util';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { GetBackgroundColor, GetColor } from '../systems/ui';
import InteractionMixin from './interaction-mixin';
import { PAINTER_CONSTANTS } from '../constants';
import mixin from '../../gui/components/mixin';
const THREE: any = (window as any).THREE;


function loadFontAtlas(path) {
    const promise = new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(path, resolve);
    });

    return promise;
}

function loadFont(path) {
    const promise = new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(path, resolve);
    });

    return promise;
}

export default function () {
    AFRAME.registerComponent('infinity-list', {
        schema: {
            selectionevent: { type: 'string' },
            closeevent: { type: 'string' },
            hideClose: { type: 'boolean', default: false },
            columns: { type: 'number', default: 4 },
            width: { type: 'number', default: 3 },
            height: { type: 'number', default: 2.2 },
            boxMargin: { type: 'number', default: .2 },
            itemtemplate: { type: 'string' },
            itemSize: { type: 'number', default: .5 },
            itemHeight: { type: 'number', default: 0 },
            itemWidth: { type: 'number', default: 0 },
            iconFont: { type: 'string', default: '' },
            icon: { type: 'string', default: '' },
            speed: { type: 'string', default: 0 },
            iconFontSize: { type: 'string', default: '' },
            options: {
                parse: (val) => {
                    console.log(val);
                    if (typeof val !== `string`) {
                        return val;
                    }
                    return JSON.parse(val);
                }, default: []
            },
            selected: { type: 'string' },
            textValueMap: { type: 'string', default: '' }
        },
        setup: function () {
            let me = this;
            let itemHeight = this.data.itemHeight || this.data.itemSize || .5;
            let itemWidth = this.data.itemWidth || this.data.itemSize || .5;
            let outerBoxWidth = this.data.width || 3;
            let boxHeight = this.data.height || 2.2;
            let boxMargin = this.data.boxMargin || .2
            let windowHeight = boxHeight - boxMargin;
            this.boxHeight = boxHeight;
            this.outerBoxWidth = outerBoxWidth;
            this.guiItem = { width: itemWidth, height: itemHeight }
            this.stepSize = .1;
            me.radius = .25; // Radius of the circle
            me.fontSize = .001;
            me.currentRotation = 0;
            me.visible_items = getNumberOfVisibleItems(itemHeight + me.itemMargin, windowHeight, this.data.columns); // Number of items visible at a time
            me.imageMargin = .01
            me.itemMargin = .1
            me.currentIndex = 0;
            me.currentIndexScroll = 0;
            me.targetScroll = 0
            me.visibleObjects = {};
            me.visibleItemObjects = {};
            let options = me.getOptions();
            me.options = options;
            let sprocket = me.sprocket || document.createElement('a-entity');
            me.sprocket = sprocket;
            sprocket.setAttribute('position', `0 ${-windowHeight / 2 + .1} 0`)
            me.el.appendChild(sprocket);
            me.itemHeight = itemHeight;
            me.itemWidth = itemWidth;
            me.windowHeight = windowHeight;
            me.windowMargin = { y: .3 }
        },
        updateSubComponents: function () {
            let outerBoxWidth = this.outerBoxWidth;
            let boxHeight = this.boxHeight;
            let windowHeight = this.windowHeight;
            this.slider.setAttribute('width', `${boxHeight}`);
            this.outerBox.setAttribute('width', `${outerBoxWidth - this.sliderWidth - this.sliderHorizontalMargin}`);
            this.outerBox.setAttribute('height', `${boxHeight}`);
            this.outerBox.setAttribute('position', `${-this.sliderWidth + -this.sliderHorizontalMargin} 0 -.02`);
            this.sliderContainer.setAttribute('position', `${outerBoxWidth / 2 - this.sliderWidth / 2} 0 .0`);
            this.closeButton.setAttribute('position', `${-outerBoxWidth / 2 - .1} ${windowHeight / 2 - .1} 0`);
            this.updateElementSize(this, this.el);
        },
        init: function () {
            let me = this;
            this.onInit();
            var system = this.el.sceneEl.systems.ui; // Access by system name
            this.setup();
            this.system = system;
            let outerBox: any = document.createElement('frame-rounded');
            outerBox.setAttribute("gui-interactable", {})
            outerBox.setAttribute('color', GetBackgroundColor());

            outerBox.setAttribute('gui-interactable', {})
            outerBox.setAttribute('position', '0 0 .01')
            outerBox.setAttribute('opacity', ".25")
            this.outerBox = outerBox;
            me.el.appendChild(outerBox);

            let slider = document.createElement('a-gui-slider');
            slider.setAttribute('percent', `${0}`);
            if (this.data.textValueMap) {
                slider.setAttribute('text-value-map', this.data.textValueMap);
            }
            this.sliderWidth = 0.2;
            this.sliderHorizontalMargin = .2
            this.el.addEventListener('update-attribute', (evt: any) => {
                let { detail } = evt;
                let { attribute, value } = detail;
                me.el.setAttribute(attribute, value)
            })
            slider.setAttribute('targetbarsize', this.sliderWidth);
            slider.addEventListener('change', (evt: any) => {
                let { value } = evt.detail;
                me.targetScroll = (me.itemHeight * (me.options?.length || 0) / me.data.columns) * value;
                handleCheckForMore(value);
            });
            let sliderContainer = document.createElement('a-entity');
            sliderContainer.setAttribute('rotation', `0 0 90`);
            this.sliderContainer = sliderContainer;
            sliderContainer.appendChild(slider);
            this.slider = slider;
            outerBox.appendChild(sliderContainer);


            let closeButton = document.createElement('frame-gui-icon-label-button');
            closeButton.setAttribute('width', '0.25')
            closeButton.setAttribute('height', '0.25')
            closeButton.addEventListener('click', () => {
                me.el.emit(me.data.closeevent, {});
                me.targetScroll += me.itemHeight * (me.visible_items + .5);
                me.targetScroll = Math.min(me.targetScroll, me.itemHeight * me.options.length);
            });
            closeButton.setAttribute('value', '')
            if (this.data.iconFont) {
                closeButton.setAttribute('icon-font', this.data.iconFont)
                closeButton.setAttribute('icon', this.data.icon || 'f128')
                closeButton.setAttribute('icon-font-size', this.data.iconFontSize || '0.1')
            }
            closeButton.setAttribute('margin', '0 0 0.05 0.02')

            if (!this.data.hideClose) {
                outerBox.appendChild(closeButton);
            }
            this.closeButton = closeButton;

            outerBox.classList.add('raycastable');
            const canvas = this.el.sceneEl.canvas;
            function handleCheckForMore(value: number) {
                if (value > .99) {
                    me.el.emit('request-more-data', {});
                }
                else if (value < .01) {

                    me.el.emit('request-more-data', { atStart: true });
                }
            }
            canvas.addEventListener('wheel', (event) => {
                if (me.sprocketHovering || me.sliderHovering || me.elHovering || me.outerboxHovering || me.sliderContainerHovering || me.raycastersIntersecting || me.mouseIntersecting) {
                    const deltaY = event.deltaY / 400;
                    let maxHeight = (me.itemHeight * (me.options?.length || 0) / me.data.columns);
                    me.targetScroll = Math.min(Math.max(me.targetScroll + deltaY, 0), (me.itemHeight * me.options.length / me.data.columns));
                    if (maxHeight) {
                        slider.setAttribute('percent', `${Math.max(0, Math.min(me.targetScroll / maxHeight, 1))}`)
                        handleCheckForMore(Math.max(0, Math.min(me.targetScroll / maxHeight, 1)));
                    }
                }
            });
            canvas.addEventListener('axismove', (event) => {
                if (event?.detail?.axis) {
                    if (me.sprocketHovering || me.sliderHovering || me.elHovering || me.outerboxHovering || me.sliderContainerHovering || me.raycastersIntersecting || me.mouseIntersecting) {
                        const deltaY = event?.detail?.axis / 4;
                        let maxHeight = (me.itemHeight * (me.options?.length || 0) / me.data.columns);
                        me.targetScroll = Math.min(Math.max(me.targetScroll + deltaY, 0), (me.itemHeight * me.options.length / me.data.columns));
                        if (maxHeight) {
                            slider.setAttribute('percent', `${Math.max(0, Math.min(me.targetScroll / maxHeight, 1))}`)
                            handleCheckForMore(Math.max(0, Math.min(me.targetScroll / maxHeight, 1)));
                        }
                    }
                }
            });
            this.setupRayIntersectionListener(outerBox, (over) => {
                me.outerboxHovering = over;
            })
            this.setupRayIntersectionListener(sliderContainer, (over) => {
                me.sliderContainerHovering = over;
            })
            this.setupRayIntersectionListener(me.sprocket, (over) => {
                me.sprocketHovering = over;
            })

            this.setupRayIntersectionListener(slider, (over) => {
                me.sliderHovering = over;
            })
            this.setupRayIntersectionListener(this.el, (over) => {
                me.elHovering = over;
            })
            this.setupRayListener(outerBox, 'interactive', this.handleInifniteListInteractions);
            this.updateSubComponents();
            me.loadedFont = true;
        },
        ...mixin,
        getWidth: function () {
            return parseFloat(`${this.data.width}`);
        },
        getHeight: function () {
            return parseFloat(`${this.data.height}`);
        },
        ...InteractionMixin,
        update: function (oldData) {
            let me = this;
            if (JSON.stringify(this.data.options) !== JSON.stringify(oldData.options || '')) {
                let options = me.getOptions();
                me.options = options;
                let keys = Object.keys(me.visibleObjects);
                for (let k = 0; k < keys.length; k++) {
                    let key = parseInt(keys[k]);
                    if (!me?.data?.itemtemplate) {
                        let vo = me.visibleObjects[key];
                        try {
                            if (vo?.parentNode)
                                vo.parentNode.removeChild(vo);
                        } catch (e) { console.log(e) }
                        delete me.visibleObjects[key]
                        delete me.visibleItemObjects[key]
                    }
                    else {
                        if (me.visibleItemObjects[key]?.item) {
                            me.visibleItemObjects[key]?.item.setAttribute('options', JSON.stringify({
                                ...me.visibleItemObjects[key]?.option,
                                ...options,
                                imageMargin: me.imageMargin,
                                selectionevent: me.data.selectionevent,
                                guiItem: me.guiItem,
                            }));
                        }
                    }
                }
            }
            if (this.data.width !== oldData?.width || this.data.height !== oldData?.height) {
                this.setup();
                this.updateSubComponents();
            }

            if (this.slider && this.data.textValueMap && this.data.textValueMap !== oldData.textValueMap) {
                this.slider.setAttribute('text-value-map', this.data.textValueMap);
            }
        },
        handleInifniteListInteractions: function (args) {
            if (this.system) {
                console.log('handleInifniteListInteractions')
                let step = this.stepSize;
                let me = this;
                const { uv, x, y, raycaster, entity } = args;
                let raycastid = raycaster?.components?.raycaster?.el?.id;
                if (this.system.getButtonState(raycastid, 'thumbsticktouch') === 'down') {
                    let detail = this.system.getButtonStateDetail(raycastid, 'thumbstickmoved');
                    console.log('thumbstickmoved')
                    console.log(JSON.stringify(detail))
                    if (detail.y > 0.95) {
                        console.log("DOWN");
                        this.setRaycastStates(raycastid, 'direction', 'down')
                    }
                    else if (detail.y < -0.95) {
                        console.log("UP");
                        this.setRaycastStates(raycastid, 'direction', 'up')
                    }
                    else if (detail.x < -0.95) {
                        console.log("LEFT");
                        this.setRaycastStates(raycastid, 'direction', 'left')
                    }
                    else if (detail.x > 0.95) {
                        console.log("RIGHT");
                        this.setRaycastStates(raycastid, 'direction', 'right')
                    }
                    else {
                        this.setRaycastStates(raycastid, 'direction', '')
                    }

                    this.setRaycastStates(raycastid, 'pressed', this.system.getButtonState(raycastid, 'trigger') === 'down')
                }
                else if (this.system.getButtonState(raycastid, 'thumbsticktouch') === 'up') {
                    console.log('thumbsticktouch')
                    this.setRaycastStates(raycastid, 'direction', '')
                }
                if (this.system && args) {
                    const { x, y, raycaster } = args;
                    let raycastid = raycaster?.components?.raycaster?.el?.id;
                    if (raycastid) {
                        switch (this.getRaycastState(raycastid, 'direction')) {
                            case 'down':
                                me.currentIndexScroll += step;
                                break;
                            case 'up':
                                me.currentIndexScroll -= step;
                                break;
                            case 'left':
                                break;
                            case 'up':
                                break;
                            default:
                                break;
                        }
                    }
                    console.log(`me.currentIndexScroll: ${me.currentIndexScroll}`)
                }
            }
        },
        tick: function () {
            let me = this;
            let columns = this.data.columns;
            this.onInit();
            let itemHeight = me.itemHeight + me.itemMargin;
            let itemWidth = me.itemWidth + me.itemMargin;
            let windowHeight = me.windowHeight;
            let scrollPosition = me.currentIndexScroll;
            if (me.loadedFont) {
                let to_add = [];
                let to_remove = [];
                let is_adding = {};
                let range = getVisibleItemRange(itemHeight, windowHeight - me.windowMargin.y, scrollPosition, columns)
                for (let i = range[0]; i <= range[1]; i++) {
                    if (i >= 0 && me.options.length > i) {
                        let optionIndex = i;
                        if (!me.visibleObjects[optionIndex] && !is_adding[optionIndex]) {
                            to_add.push(me.options[optionIndex]);
                            is_adding[optionIndex] = true;
                        }
                    }
                }
                let keys = Object.keys(me.visibleObjects);
                for (let k = 0; k < keys.length; k++) {
                    let key = parseInt(keys[k]);
                    if (!(range[0] <= key && range[1] >= key)) {
                        to_remove.push(key);
                    }
                }
                to_remove.forEach((key) => {
                    let vo = me.visibleObjects[key];
                    try {
                        if (vo?.parentNode) {
                            vo.parentNode.removeChild(vo);
                        }
                    } catch (e) { console.log(e) }
                    delete me.visibleObjects[key]
                    delete me.visibleItemObjects[key]
                });
                to_add.forEach((option: { id: number, value: number, text: string }) => {
                    let { entity, item, option: opt } = me.createOptionEl(option, (Math.PI / me.visible_items / 2) * option.id);
                    me.sprocket.appendChild(entity);
                    me.visibleObjects[option.id] = entity;
                    me.visibleItemObjects[option.id] = { item, option: opt };
                })
                // console.log(`me.currentIndexScroll: ${me.currentIndexScroll}`)
                // this.currentIndex = Math.floor(me.currentIndexScroll % me.visible_items);
                this.currentRotation = me.currentIndexScroll;
                for (let key in me.visibleObjects) {
                    let indexKey = parseInt(key);
                    let posY = calculateItemPosition(indexKey, itemHeight, me.currentIndexScroll, columns) + (itemHeight / 2)
                    let posX = calculateColumn(indexKey, itemWidth, columns) - (this.outerBoxWidth / 2) + (itemWidth / 2);
                    me.visibleObjects[key].setAttribute('position', `${posX} ${posY} 0`);
                    if (indexKey > (range[1] - columns) || indexKey < (range[0] + columns)) {
                        me.visibleObjects[key].setAttribute('opacity', 0);
                    }
                    else {
                        me.visibleObjects[key].setAttribute('opacity', 1);
                    }
                }
                // me.time = me.time || 0
                // me.time += .001;
                // me.currentIndexScroll -= Math.sin(me.time) * .001
                if (Math.abs(me.currentIndexScroll - me.targetScroll) > .0001) {
                    if (Math.abs(me.currentIndexScroll - me.targetScroll) > this.outerBoxWidth) {
                        if (me.currentIndexScroll > me.targetScroll) {
                            me.currentIndexScroll = me.currentIndexScroll - this.outerBoxWidth;
                        }
                        else {
                            me.currentIndexScroll = me.currentIndexScroll + this.outerBoxWidth;
                        }
                    }
                    me.currentIndexScroll = lerp(me.currentIndexScroll, me.targetScroll, this.data.speed || .3)
                }
            }
            // me.sprocket.setAttribute('rotation', `${currentRotation % 360} 0 0`)
            // this.currentRotation += .1
        },
        createOptionEl: function (options) {
            let me = this;
            let { value, id, text, url } = options;
            if (me?.data?.itemtemplate) {
                let item = document.createElement(me.data.itemtemplate);
                item.setAttribute('options', JSON.stringify({
                    ...options,
                    imageMargin: me.imageMargin,
                    selectionevent: me.data.selectionevent,
                    guiItem: me.guiItem,
                    value,
                    id,
                    text,
                    url,
                }));
                item.setAttribute('selectionevent', this.data.selectionevent);
                let entity: any = document.createElement('a-entity');
                entity.setAttribute('rotation', `0 0 0`)
                entity.appendChild(item);
                return {
                    entity, item, option: {
                        ...options,
                        imageMargin: me.imageMargin,
                        selectionevent: me.data.selectionevent,
                        guiItem: me.guiItem,
                        value,
                        id,
                        text,
                        url,
                    }
                };
            }
            let entity: any = document.createElement('a-entity');
            entity.setAttribute('rotation', `0 0 0`)

            let imageEntity: any = document.createElement('frame-ar-image');
            imageEntity.setAttribute('maxwidth', `${me.guiItem.height - me.imageMargin}`);
            imageEntity.setAttribute('maxheight', `${me.guiItem.height - me.imageMargin}`);
            imageEntity.setAttribute('position', `${(-me.guiItem.width / 2) + (me.guiItem.height / 2)} 0 .03`)
            imageEntity.setAttribute('url', url);

            var buttonContainer = document.createElement("frame-gui-button");
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
            buttonContainer.addEventListener('click', () => {

            })
            buttonContainer.setAttribute('height', me.guiItem.height);
            buttonContainer.setAttribute('margin', `0 0 0.01 0`);
            buttonContainer.setAttribute('width', me.guiItem.width);
            buttonContainer.classList.add('raycastable')
            buttonContainer.addEventListener('click', function () {
                me.el.emit(me.data.selectionevent, { value, id, text, url });
            })
            let textEntity = me.createText(text || value || ``);
            let textBackground = document.createElement('a-entity');
            textBackground.setAttribute('geometry', `primitive: plane; width: ${me.guiItem.width}; height: ${me.guiItem.height / 10}; depth: 0.02;`);
            textBackground.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${GetColor(0)}`);
            textBackground.setAttribute('position', `0 ${(-me.guiItem.height / 2) + 0.04} .04`)
            textBackground.appendChild(textEntity);
            buttonContainer.appendChild(textBackground);
            buttonContainer.appendChild(imageEntity);
            entity.appendChild(buttonContainer);

            return {
                entity
            }
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
        getOptions: function () {
            if (this?.data?.options?.length) {
                return this.data.options;
            }
            return [
                "Apple",
            ].map((text, index) => {
                return {
                    id: index,
                    value: index,
                    text,
                    url: 'https://cdn.midjourney.com/7acac49c-096e-41db-9ddb-9e592e0dd31b/0_2.webp'
                }
            })

        }
    });

    AFRAME.registerComponent('ar-image', {
        schema: {
            url: { type: 'string' },
            maxwidth: { type: 'number' },
            maxheight: { type: 'number' }
        },
        init: function () {
            this.initImage();
        },
        ...mixin,
        getWidth: function () {
            return parseFloat(`${this?.size?.width || 0}`);
        },
        getHeight: function () {
            return parseFloat(`${this?.size?.height || 0}`);
        },
        update: function (oldData) {
            if (oldData.url && oldData.url !== this.data.url) {
                // this.el.setAttribute('material', { src: this.data.url });
                this.initImage();
            }
            else if (!oldData.url && oldData.url !== this.data.url) {
                this.initImage();
            }
        },
        initImage: function () {
            if (this.data.url) {
                this.el.setAttribute('visible', 'true')
                const image = new Image();
                image.crossOrigin = 'anonymous'; // Use this if your image is hosted on a different domain
                image.src = this.data.url;

                image.onload = () => {
                    const naturalAspectRatio = image.naturalWidth / image.naturalHeight;
                    let finalWidth, finalHeight;

                    // Calculate width and height based on aspect ratio and maximum dimensions
                    if (image.naturalWidth > image.naturalHeight) {
                        finalWidth = Math.min(this.data.maxwidth, image.naturalWidth);
                        finalHeight = finalWidth / naturalAspectRatio;
                        if (finalHeight > this.data.maxheight) {
                            finalHeight = this.data.maxheight;
                            finalWidth = finalHeight * naturalAspectRatio;
                        }
                    } else {
                        finalHeight = Math.min(this.data.maxheight, image.naturalHeight);
                        finalWidth = finalHeight * naturalAspectRatio;
                        if (finalWidth > this.data.maxwidth) {
                            finalWidth = this.data.maxwidth;
                            finalHeight = finalWidth / naturalAspectRatio;
                        }
                    }
                    this.size = {
                        width: finalWidth,
                        height: finalHeight
                    }

                    this.updateElementSize(this, this.el);

                    // Set the geometry and material of the entity
                    this.el.setAttribute('geometry', {
                        primitive: 'plane',
                        width: finalWidth,
                        height: finalHeight
                    });
                    // Create a texture from the loaded image
                    const texture = new THREE.Texture(image);
                    texture.needsUpdate = true;

                    // Get the mesh of the A-Frame entity
                    const mesh = this.el.getObject3D('mesh');
                    if (mesh) {
                        // Apply the texture to the material
                        mesh.material = new THREE.MeshBasicMaterial({ map: texture });
                        mesh.material.needsUpdate = true;
                    }
                };
            }
            else {
                this.el.setAttribute('visible', 'false')
            }
        }
    });
    AFRAME.registerPrimitive('frame-ar-image', {
        defaultComponents: {
            'ar-image': {}
        },
        mappings: {
            url: 'ar-image.url',
            maxwidth: 'ar-image.maxwidth',
            maxheight: 'ar-image.maxheight'
        }
    });

    AFRAME.registerPrimitive('frame-infinite-list', {
        defaultComponents: {
            'infinity-list': {}
        },
        mappings: {
            itemtemplate: 'infinity-list.itemtemplate',
            selectionevent: 'infinity-list.selectionevent',
            closeevent: 'infinity-list.closeevent',
            'icon-font': 'infinity-list.iconFont',
            'icon-font-size': 'infinity-list.iconFontSize',
            'icon': 'infinity-list.icon',
            'text-value-map': 'infinite-list.textValueMap',
            speed: 'infinity-list.speed',
            sourceId: 'infinity-list.sourceId',
            options: 'infinity-list.options',
            width: 'infinity-list.width',
            height: 'infinity-list.height',
            margin: 'infinity-list.boxMargin',
            columns: 'infinity-list.columns',
            itemsize: 'infinity-list.itemSize',
            itemheight: 'infinity-list.itemHeight',
            itemwidth: 'infinity-list.itemWidth',
            selected: 'infinity-list.selected',
            hideclose: 'infinity-list.hideClose'
        }
    });
    // Example usage in an A-Frame scene
    // <a-scene>
    //     <a-entity ar-image="url: https://example.com/my-image.jpg; maxwidth: 3; maxheight: 2"></a-entity>
    // </a-scene>


    // Example usage in an A-Frame scene
    // <a-scene>
    //     <a-entity ar-image="url: https://example.com/my-image.jpg; width: 5"></a-entity>
    // </a-scene>    
}

function isIndexOutsideRange(rangeStart, rangeEnd, index) {
    if (rangeStart > rangeEnd) {
        return !(
            (rangeStart <= index && rangeEnd <= index) ||
            (rangeEnd >= index && rangeStart >= index)
        );
    }

    return !(rangeStart <= index && rangeEnd >= index)
}

function isIndexOutsideRange_bad(totalItems, rangeStart, rangeEnd, index) {
    // Normalize indices to handle wrap-around
    rangeEnd = (rangeEnd >= totalItems) ? rangeEnd % totalItems : rangeEnd;
    rangeStart = (rangeStart >= totalItems) ? rangeStart % totalItems : rangeStart;
    index = (index >= totalItems) ? index % totalItems : index;

    if (rangeStart <= rangeEnd) {
        // Normal scenario: start index is less than or equal to end index
        return index < rangeStart || index > rangeEnd;
    } else {
        // Wrap-around scenario: start index is greater than end index
        // The index is outside the range if it's not between rangeEnd and rangeStart
        return !(index > rangeEnd || index < rangeStart);
    }
}
function calculateItemPosition(index: number, itemHeight: number, scrollPosition: number, columns: number = 1): number {
    // Calculate the row number where the item is located
    const row = Math.floor(index / columns);

    // Calculate the starting position of the item based on its row
    const itemStartPosition = row * itemHeight;

    // Adjust by the scroll position to get its position within the current view
    const relativePosition = itemStartPosition - scrollPosition;

    return relativePosition;
}

function calculateColumn(index: number, itemWidth: number, columns: number = 1): number {
    // Ensure the number of columns is at least 1
    columns = Math.max(columns, 1);

    // The column is the remainder of the index divided by the number of columns
    return (index % columns) * itemWidth;
}
function getNumberOfVisibleItems(itemHeight: number, windowHeight: number, column: number) {
    return (windowHeight / itemHeight) * column;
}
function getVisibleItemRange(itemHeight: number, windowHeight: number, scrollPosition: number, columns: number = 1): [number, number] {
    // Ensure that the first index is not negative
    const firstIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) * columns);

    // Calculate the last index, ensuring it doesn't go negative
    const lastIndex = Math.max(0, Math.ceil((scrollPosition + windowHeight) / itemHeight) * columns) - 1;

    return [firstIndex, lastIndex];
}

function lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
}
