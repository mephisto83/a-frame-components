import { AFRAME } from "../../react/root";
import { createText } from "../../util";
import { key_orange, key_offwhite, key_grey, key_white, key_grey_light } from "../vars";
import interactionMixin from "../../react/components/interaction-mixin";
import mixin from "./mixin";

export default function () {
    let guiSliderSchema = {
        activeColor: { type: 'string', default: key_orange },
        backgroundColor: { type: 'string', default: key_offwhite },
        borderColor: { type: 'string', default: key_grey },
        targetbarsize: { type: 'number', default: 0 },
        title: { type: 'string', default: '' },
        handleColor: { type: 'string', default: key_grey_light },
        handleInnerDepth: { type: 'number', default: 0.02 },
        titlePosition: { type: 'string', default: '' },
        titleScale: { type: 'string', default: '' },
        handleInnerRadius: { type: 'number', default: 0.05 },
        handleOuterDepth: { type: 'number', default: 0.04 },
        handleOuterRadius: { type: 'number', default: 0.07 },
        hoverColor: { type: 'string', default: key_white },
        leftRightPadding: { type: 'number', default: 0.25 },
        percent: { type: 'number', default: 0.5 },
        sliderBarHeight: { type: 'number', default: 0.05 },
        sliderBarDepth: { type: 'number', default: 0.01 },
        topBottomPadding: { type: 'number', default: 0.125 },
        titleTextFont: { type: 'string', default: '' },
        percentageTextFont: { type: 'string', default: '' },
        textValueMap: { type: 'string', default: '' },
        min: { type: 'number', default: 0 },
        max: { type: 'number', default: 100 },
        nearest: { type: 'number', default: 1 }
    };

    AFRAME.registerComponent('gui-slider', {
        schema: guiSliderSchema,
        ...mixin,
        init: function () {
            let me = this;
            var data = this.data;
            var el = this.el;
            var guiItem = el.getAttribute("gui-item");
            var sliderWidth = guiItem.width - data.leftRightPadding * 2.0
            var sliderHeight = guiItem.height - data.topBottomPadding * 2.0
            let lowerBound = (guiItem.width - sliderWidth) / guiItem.width * .5;
            let upperBound = 1 - lowerBound;


            let targetBar: any = document.createElement('a-plane');
            targetBar.setAttribute('height', `${me.data.targetbarsize || sliderHeight * 3}`);
            targetBar.setAttribute('width', `${guiItem.width}`);
            targetBar.setAttribute('material', `shader: flat; opacity: 0;  color: ${data.backgroundColor}; side:double;`);
            targetBar.setAttribute('gui-interactable', {})
            if (this.data.title) {
                let text = document.createElement('frame-troika-text');
                if (this.data.percentageTextFont) {
                    text.setAttribute('font', this.data.percentageTextFont);
                }
                text.setAttribute('anchor', 'left');
                text.setAttribute('value', this.data.title);
                if (this.data.titlePosition) {
                    text.setAttribute('position', this.data.titlePosition);
                }
                if (this.data.titleScale) {
                    text.setAttribute('scale', this.data.titleScale);
                }
                this.titleText = text;
                el.appendChild(text);
            }
            this.setupRayListener(targetBar, 'interaction', (evt) => {
                if (me.mousedown) {
                    let x = mapPercentage(evt.uv.x, lowerBound, upperBound)
                    data.percent = x;
                    me.positionElements();
                    targetBar.emit('change', { value: x })
                }
            });
            targetBar.addEventListener('mousedown', function (evt) {
                // Check if the primary (left) mouse button is pressed
                me.mousedown = true;
            });
            document.addEventListener('mouseup', () => {
                me.mousedown = false;
            })

            el.appendChild(targetBar);
            let text = createText(me.getText(), { color: '#ffffff', fontFamily: this.data.titleTextFont || '' });
            let textContainer = document.createElement('a-entity');
            textContainer.setAttribute('position', `${guiItem.width / 2} 0 0`);
            textContainer.appendChild(text);
            this.text = text;
            el.appendChild(textContainer);
            // el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.height};`);

            let { first, second } = calculateSections(data.percent, sliderWidth);

            var sliderActiveBar = document.createElement("a-entity");
            sliderActiveBar.setAttribute('geometry', `primitive: box; width: ${first.width}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderActiveBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.activeColor};`);
            sliderActiveBar.setAttribute('position', `${first.offset} 0 ${data.sliderBarDepth - 0.01}`);
            this.sliderActiveBar = sliderActiveBar;
            el.appendChild(sliderActiveBar);

            var sliderBar = document.createElement("a-entity");
            sliderBar.setAttribute('geometry', `primitive: box; width: ${second.width}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderBar.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
            sliderBar.setAttribute('position', `${second.offset} 0 ${data.sliderBarDepth - 0.01}`);
            this.sliderBar = sliderBar;
            el.appendChild(sliderBar);

            var handleContainer = document.createElement("a-entity");
            handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
            handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
            handleContainer.setAttribute('rotation', '90 0 0');
            handleContainer.setAttribute('position', `${data.percent * sliderWidth - sliderWidth * 0.5} 0 ${data.handleOuterDepth - 0.01}`);
            this.handleContainer = handleContainer;
            el.appendChild(handleContainer);

            var handle: any = document.createElement("a-entity");
            handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
            handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
            handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
            handleContainer.appendChild(handle);

            el.addEventListener('mouseenter', function () {
                handle.setAttribute('material', 'color', data.hoverColor);
            });

            el.addEventListener('mouseleave', function () {
                handle.setAttribute('material', 'color', data.handleColor);
            });
        },
        ...interactionMixin,
        update: function (oldData) {
            this.positionElements();
            if (oldData?.title !== this.data.title) {
                if (this.titleText) {
                    this.titleText.setAttribute('value', this.data.title);
                }
            }
            if (this.data.textValueMap !== oldData?.textValueMap) {
                this.textValueMap = JSON.parse(this.data.textValueMap);
            }
        },
        tick: function () {
            this.onTick();
        },
        remove: function () {
        },
        pause: function () {
        },
        play: function () {
        },
        getText: function () {
            let num = mapRange(this.data.percent, this.data.min, this.data.max);
            if (this.textValueMap) {
                let textValueMap: { text: string, value: number }[] = this.textValueMap;
                let item = findClosestValue(textValueMap, num);
                if (item) {
                    return item.text;
                }
            }
            return `${Math.round(num * this.data.nearest) / this.data.nearest}`;
        },
        positionElements: function () {
            let el = this.el;
            let data = this.data;
            let sliderActiveBar = this.sliderActiveBar;
            let handleContainer = this.handleContainer;
            let sliderBar = this.sliderBar;
            var guiItem = el.getAttribute("gui-item");
            var sliderWidth = guiItem.width - data.leftRightPadding * 2.0;
            this.text.setAttribute('troika-text', 'value', this.getText());
            let { first, second } = calculateSections(data.percent, sliderWidth);
            sliderActiveBar.setAttribute('geometry', `primitive: box; width: ${first.width}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            sliderActiveBar.setAttribute('position', `${first.offset} 0 ${data.sliderBarDepth - 0.01}`);
            sliderBar.setAttribute('position', `${second.offset} 0 ${data.sliderBarDepth - 0.01}`);
            sliderBar.setAttribute('geometry', `primitive: box; width: ${second.width}; height: ${data.sliderBarHeight}; depth: ${data.sliderBarDepth};`);
            handleContainer.setAttribute('position', `${data.percent * sliderWidth - sliderWidth * 0.5} 0 ${data.handleOuterDepth - 0.01}`);
        }
    });
    const guiSliderMappings = {
        'active-color': 'gui-slider.activeColor',
        'background-color': 'gui-slider.backgroundColor',
        'targetbarsize': 'gui-slider.targetbarsize',
        'border-color': 'gui-slider.borderColor',
        'handle-color': 'gui-slider.handleColor',
        'handle-inner-depth': 'gui-slider.handleInnerDepth',
        'handle-inner-radius': 'gui-slider.handleInnerRadius',
        'handle-outer-depth': 'gui-slider.handleOuterDepth',
        'handle-outer-radius': 'gui-slider.handleOuterRadius',
        'height': 'gui-item.height',
        'title-position': 'gui-slider.titlePosition',
        'title-scale': 'gui-slider.titleScale',
        'hover-color': 'gui-slider.hoverColor',
        'left-right-padding': 'gui-slider.leftRightPadding',
        'title': 'gui-slider.title',
        'margin': 'gui-item.margin',
        'percent': 'gui-slider.percent',
        'slider-bar-depth': 'gui-slider.sliderBarDepth',
        'slider-bar-height': 'gui-slider.sliderBarHeight',
        'top-bottom-padding': 'gui-slider.topBottomPadding',
        'width': 'gui-item.width',
        'title-text-font': 'gui-slider.titleTextFont',
        'percentage-text-font': 'gui-slider.percentageTextFont',
        'text-value-map': 'gui-slider.textValueMap',
    }
    const guiSliderComponents = {
        'gui-item': { type: 'slider' },
        'gui-slider': {}
    };
    AFRAME.registerPrimitive('a-gui-slider', {
        defaultComponents: guiSliderComponents,
        mappings: guiSliderMappings
    });

    function assignProperties(el: any, data: any) {
        for (let i in data) {
            el.setAttribute(i, data[i]);
        }
    }
    AFRAME.registerComponent('slider', {
        schema: {
            ...guiSliderSchema,
            'barLength': { type: 'number', default: 2 },
            'barThickness': { type: 'number', default: .3 },
            orientation: { type: 'string', default: 'horizontal' }
        },
        ...mixin,
        init: function () {
            let me = this;
            let guiSlider = document.createElement('a-gui-slider');
            let container = document.createElement('a-entity');
            me.guiSlider = guiSlider;
            me.container = container;
            assignProperties(guiSlider, {
                ... this.data,
                width: this.data.barLength,
                height: this.data.barThickness
            });
            container.appendChild(guiSlider);
            me.el.appendChild(container);
            me.updateOrientation();
        },
        updateOrientation: function () {
            let me = this;
            switch (me.data.orientation) {
                case 'vertical':
                    me.container.setAttribute('animation__rotation', `property: rotation; to:0 0 90; dur:500; easing:easeInOutCubic;`);
                    break;
                default:
                    me.container.setAttribute('animation__rotation', `property: rotation; to:0 0 0; dur:500; easing:easeInOutCubic;`);
                    break;
            }
            me.updateElementSize(me, me.el);
        },
        getWidth: function () {
            let me = this;
            switch (me.data.orientation) {
                case 'vertical':
                    return parseFloat(`${this.data.targetbarsize || this.data.barThickness}`);
                default:
                    return parseFloat(`${this.data.barLength}`);
            }
        },
        getHeight: function () {
            let me = this;
            switch (me.data.orientation) {
                case 'vertical':
                    return parseFloat(`${this.data.barLength}`);
                default:
                    return parseFloat(`${this.data.targetbarsize || this.data.barThickness}`);
            }
        },
        update: function (oldData: any) {
            let me = this;
            if (oldData?.orientation) {
                if (oldData?.orientation !== this.data.orientation) {
                    let temp = this.data.width;
                    this.data.width = this.data.height;
                    this.data.height = temp;
                }
            }
            assignProperties(me.guiSlider, {
                ... this.data,
                width: this.data.barLength,
                height: this.data.barThickness
            });
            me.updateOrientation();
        }
    });
    AFRAME.registerPrimitive('frame-slider', {
        defaultComponents: {
            'gui-item': { type: 'slider' },
            'slider': {}
        },
        mappings: {
            'active-color': 'slider.active-color',
            'background-color': 'slider.background-color',
            'targetbarsize': 'slider.targetbarsize',
            'border-color': 'slider.border-color',
            'handle-color': 'slider.handle-color',
            'handle-inner-depth': 'slider.handle-inner-depth',
            'handle-inner-radius': 'slider.handle-inner-radius',
            'handle-outer-depth': 'slider.handle-outer-depth',
            'handle-outer-radius': 'slider.handle-outer-radius',
            'title-position': 'slider.title-position',
            'title-scale': 'slider.title-scale',
            'hover-color': 'slider.hover-color',
            'left-right-padding': 'slider.left-right-padding',
            'title': 'slider.title',
            'margin': 'item.margin',
            'percent': 'slider.percent',
            'slider-bar-depth': 'slider.slider-bar-depth',
            'slider-bar-height': 'slider.slider-bar-height',
            'top-bottom-padding': 'slider.top-bottom-padding',
            'bar-length': 'slider.barLength',
            'bar-thickness': 'slider.barThickness',
            'title-text-font': 'slider.title-text-font',
            'percentage-text-font': 'slider.percentage-text-font',
            orientation: 'slider.orientation',
        }
    });
    AFRAME.registerComponent('gui-handle', {
        schema: {
            activeColor: { type: 'string', default: key_orange },
            backgroundColor: { type: 'string', default: key_offwhite },
            borderColor: { type: 'string', default: key_grey },
            targetbarsize: { type: 'number', default: 0 },
            handleColor: { type: 'string', default: key_grey_light },
            handleInnerDepth: { type: 'number', default: 0.02 },
            handleInnerRadius: { type: 'number', default: 0.05 },
            handleOuterDepth: { type: 'number', default: 0.04 },
            handleOuterRadius: { type: 'number', default: 0.07 },
            hoverColor: { type: 'string', default: key_white },
            leftRightPadding: { type: 'number', default: 0.25 },
            percent: { type: 'number', default: 0.5 },
            sliderBarHeight: { type: 'number', default: 0.05 },
            sliderBarDepth: { type: 'number', default: 0.01 },
            topBottomPadding: { type: 'number', default: 0.125 },
        },
        init: function () {
            var data = this.data;
            var el = this.el;
            var guiItem = el.getAttribute("gui-item");
            var sliderWidth = guiItem.width - data.leftRightPadding * 2.0
            var handleContainer: any = document.createElement("a-entity");
            handleContainer.setAttribute('gui-interactable', {})
            handleContainer.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleOuterRadius}; height: ${data.handleOuterDepth};`);
            handleContainer.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.borderColor};`);
            handleContainer.setAttribute('rotation', '90 0 0');
            handleContainer.setAttribute('position', `${data.percent * sliderWidth - sliderWidth * 0.5} 0 ${data.handleOuterDepth - 0.01}`);
            this.handleContainer = handleContainer;
            el.appendChild(handleContainer);

            var handle: any = document.createElement("a-entity");
            handle.setAttribute('geometry', `primitive: cylinder; radius: ${data.handleInnerRadius}; height: ${data.handleInnerDepth};`);
            handle.setAttribute('material', `shader: flat; opacity: 1; side:double; color: ${data.handleColor};`);
            handle.setAttribute('position', `0 ${data.handleInnerDepth} 0`);
            handleContainer.appendChild(handle);

            el.addEventListener('mouseenter', function () {
                handle.setAttribute('material', 'color', data.hoverColor);
            });

            el.addEventListener('mouseleave', function () {
                handle.setAttribute('material', 'color', data.handleColor);
            });
        }
    })
    AFRAME.registerPrimitive('a-gui-handle', {
        defaultComponents: {
            'gui-item': {},
            'gui-handle': {}
        },
        mappings: {
            'active-color': 'gui-handle.activeColor',
            'background-color': 'gui-handle.backgroundColor',
            'targetbarsize': 'gui-handle.targetbarsize',
            'border-color': 'gui-handle.borderColor',
            'handle-color': 'gui-handle.handleColor',
            'handle-inner-depth': 'gui-handle.handleInnerDepth',
            'handle-inner-radius': 'gui-handle.handleInnerRadius',
            'handle-outer-depth': 'gui-handle.handleOuterDepth',
            'handle-outer-radius': 'gui-handle.handleOuterRadius',
            'height': 'gui-item.height',
            'hover-color': 'gui-handle.hoverColor',
            'left-right-padding': 'gui-handle.leftRightPadding',
            'margin': 'gui-item.margin',
            'percent': 'gui-handle.percent',
            'slider-bar-depth': 'gui-handle.sliderBarDepth',
            'slider-bar-height': 'gui-handle.sliderBarHeight',
            'top-bottom-padding': 'gui-handle.topBottomPadding',
            'width': 'gui-item.width',
        }
    });

    function calculateSections(percentage: number, totalWidth: number): {
        first: {
            width: number,
            offset: number,
        },
        second: {
            width: number,
            offset: number
        }
    } {
        // Calculate the width of the first section based on the percentage
        const firstSectionWidth = totalWidth * percentage;

        // Calculate the width of the second section as the remaining width
        const secondSectionWidth = totalWidth - firstSectionWidth;

        // Calculate the offsets from the center of the total width
        // The offset is the distance from the center of the total area to the center of each section
        // const firstSectionOffset = firstSectionWidth / 2;
        // const secondSectionOffset = firstSectionOffset + secondSectionWidth / 2;
        // For a centered position, the offset is calculated from the center of the total width
        // Offset for the first section is half its width to the left of the center (-0.25 for a 50% split)
        // Calculate offsets based on the center positioning requirements
        // The first section's center offset from the total width's center
        const firstSectionOffset = (firstSectionWidth / 2) - (totalWidth / 2);

        // The second section's center offset; since it's the remainder, we calculate its center differently
        const secondSectionOffset = (totalWidth / 2) - (secondSectionWidth / 2);

        return {
            first: {
                width: firstSectionWidth,
                offset: firstSectionOffset,
            },
            second: {
                width: secondSectionWidth,
                offset: secondSectionOffset
            }
        };
    }

    function mapPercentage(input: number, lowerBound: number, upperBound: number): number {

        // Clamp the values below 0.2 to 0
        if (input <= lowerBound) {
            return 0;
        }

        // Clamp the values above 0.9 to 1
        if (input >= upperBound) {
            return 1;
        }

        // Linearly map the range [0.2, 0.9] to [0, 1]
        return (input - lowerBound) / (upperBound - lowerBound);
    }
    /**
     * Maps a number from one range to another.
     * 
     * @param value The number to map.
     * @param fromLow The lower bound of the value's current range.
     * @param fromHigh The upper bound of the value's current range.
     * @param toLow The lower bound of the value's target range.
     * @param toHigh The upper bound of the value's target range.
     * @returns The number mapped to the new range.
     */
    function mapRange(
        value: number,
        toLow: number,
        toHigh: number,
        fromLow: number = 0,
        fromHigh: number = 1,
    ): number {
        // First, find the ratio of the position of 'value' relative to its current range
        const ratio = (value - fromLow) / (fromHigh - fromLow);
        // Then, scale this ratio to the target range
        const mappedValue = ratio * (toHigh - toLow) + toLow;
        return mappedValue;
    }

    function findClosestValue(textValueMap: { text: string; value: number }[], val: number): { text: string; value: number } {
        // Initialize a variable to keep track of the closest item. Start with null and will replace it with an item from textValueMap.
        let closestItem: { text: string; value: number } | null = null;

        // Initialize a variable to keep track of the smallest difference found. Start with Infinity as we haven't checked any items yet.
        let smallestDifference = Infinity;

        // Iterate over each item in textValueMap
        textValueMap.forEach(item => {
            // Convert the item's value to a number for comparison
            const itemValue = (item.value);

            // Calculate the absolute difference between the item's value and the provided val
            const difference = Math.abs(val - itemValue);

            // Check if this difference is smaller than the smallest difference we've found so far
            if (difference < smallestDifference) {
                // If so, update the smallestDifference and the closestItem
                smallestDifference = difference;
                closestItem = item;
            }
        });

        // After checking all items, return the closestItem found
        return closestItem;
    }

}
