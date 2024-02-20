import { AFRAME } from "../../painter/root";
import { key_grey, key_grey_dark, key_grey_light, key_offwhite, key_orange, key_white } from "../vars";

export default function () {
    AFRAME.registerComponent('gui-radio', {
        schema: {
            on: { default: 'click' },
            value: { type: 'string', default: '' },
            active: { type: 'boolean', default: true },
            show: { type: 'boolean', default: true },
            toggle: { type: 'boolean', default: false },
            toggleState: { type: 'boolean', default: false },
            checked: { type: 'boolean', default: false },
            radiosizecoef: { type: 'number', default: 1 },
            fontSize: { type: 'number', default: 0.2 },
            fontFamily: { type: 'string', default: '' },
            fontColor: { type: 'string', default: key_grey_dark },
            borderColor: { type: 'string', default: key_white },
            backgroundColor: { type: 'string', default: key_offwhite },
            hoverColor: { type: 'string', default: key_grey_light },
            activeColor: { type: 'string', default: key_orange },
            handleColor: { type: 'string', default: key_grey },
        },
        init: function () {
            let me = this;
            var data = this.data;
            var el = this.el;
            let guiItem: any = el.getAttribute("gui-item");
            this.guiItem = guiItem;
            var toggleState = this.toggleState = data.toggle;
            var guiInteractable = el.getAttribute("gui-interactable");
            this.guiInteractable = guiInteractable;
            this.renderCheck = this.renderCheck.bind(this);
            //fallback for old font-sizing
            if (data.fontSize > 20) { // 150/750
                var newSize = data.fontSize / 750;
                data.fontSize = newSize;
            }

            el.setAttribute('material', `shader: flat; depthTest:true;transparent: false; opacity: 1;  color: ${this.data.backgroundColor}; side:front;`);
            el.setAttribute('geometry', `primitive: plane; height: ${guiItem.height}; width: ${guiItem.width};`);

            var radioBoxX = -guiItem.width * 0.5 + guiItem.height * 0.5;
            var radioBox: any = document.createElement("a-cylinder");
            radioBox.setAttribute('radius', guiItem.height * 0.2 * data.radiosizecoef);
            radioBox.setAttribute('height', '0.01');
            radioBox.setAttribute('rotation', '90 0 0');
            radioBox.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
            radioBox.setAttribute('position', `${radioBoxX} 0 0`);
            el.appendChild(radioBox);

            var radioborder: any = document.createElement("a-torus");
            radioborder.setAttribute('radius', guiItem.height * 0.19 * data.radiosizecoef);
            radioborder.setAttribute('radius-tubular', '0.01');
            radioborder.setAttribute('rotation', '90 0 0');
            radioborder.setAttribute('material', `color:${data.borderColor}; shader: flat;`);
            radioBox.appendChild(radioborder);

            var radioCenter: any = document.createElement("a-cylinder");
            this.radioCenter = radioCenter;
            radioCenter.setAttribute('radius', guiItem.height * 0.18 * data.radiosizecoef);
            radioCenter.setAttribute('height', '0.02');
            radioCenter.setAttribute('rotation', '0 0 0');
            radioCenter.setAttribute('material', `color:${data.handleColor}; shader: flat;`);
            radioBox.appendChild(radioCenter);
            this.setText(data.value);

            this.updateToggle(data.active);
            el.setAttribute("checked", data.active);

            el.addEventListener('mouseenter', function (evt) {
                radioborder.removeAttribute('animation__leave');
                radioborder.setAttribute('animation__enter', `property: material.color; from: ${data.borderColor}; to:${data.hoverColor}; dur:200;`);
            });
            el.addEventListener('mouseleave', function (evt) {
                radioborder.removeAttribute('animation__enter');
                radioborder.setAttribute('animation__leave', `property: material.color; from: ${data.hoverColor}; to:${data.borderColor}; dur:200; easing: easeOutQuad;`);
            });
            el.addEventListener(data.on, function (evt) {
                // console.log('I was clicked at: ', evt.detail.intersection.point); // Commented out to use own made click event without defining detail
                data.checked = !data.checked;
                me.renderCheck(data);
                el.emit('changed', { data })

                var guiInteractable = el.getAttribute("gui-interactable");
                //console.log("guiInteractable: "+guiInteractable);
                var clickActionFunctionName = guiInteractable.clickAction;
                //console.log("clickActionFunctionName: "+clickActionFunctionName);
                // find object
                var clickActionFunction: any = window[clickActionFunctionName];
                //console.log("clickActionFunction: "+clickActionFunction);
                // is object a function?
                if (typeof clickActionFunction === "function") clickActionFunction(evt);
            });

            ////WAI ARIA Support
            el.setAttribute('role', 'radio');
            me.renderCheck(data);

        },
        renderCheck: function (data) {
            let radioCenter = this.radioCenter;
            if (data.checked) {
                radioCenter.setAttribute('animation__color', `property: material.color; from: ${data.handleColor}; to:${data.activeColor}; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__rotation', `property: rotation; from: 0 0 0; to:-180 0 0; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position1', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position2', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
            } else {
                radioCenter.setAttribute('animation__color', `property: material.color; from: ${data.activeColor}; to:${data.handleColor}; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__rotation', `property: rotation; from: -180 0 0; to:0 0 0; dur:500; easing:easeInOutCubic;`);
                radioCenter.setAttribute('animation__position1', `property: position; from: 0 0 0; to:0 0.3 0; dur:200; easing:easeInOutCubic; `);
                radioCenter.setAttribute('animation__position2', `property: position; from: 0 0.3 0; to:0 0 0; dur:200; easing:easeInOutCubic; delay:300;`);
            }
        },
        update: function (oldData) {
            var data = this.data;
            var el = this.el;
            this.updateToggle(data.active)
            this.renderCheck(data)
            if (this.data.show !== oldData.show) { 
                this.el.setAttribute('visible', this.data.show)
            }

            if (this.textEntity) {
                console.log("has textEntity: " + this.textEntity);

                var oldEntity = this.textEntity;
                oldEntity.parentNode.removeChild(oldEntity);

                this.setText(this.data.value);

            } else {
                console.log("no textEntity!");
            }

        },


        updateToggle: function (active) {

            if (active) {

            } else {
            }

        },
        setText: function (newText) {
            var textEntityX = this.guiItem.height - this.guiItem.width * 0.5;
            var textEntity = document.createElement("a-entity");
            this.textEntity = textEntity;
            textEntity.setAttribute('troika-text', `value: ${newText}; 
                                                align:left; 
                                                anchor:left; 
                                                baseline:center;
                                                letterSpacing:0;
                                                color:${this.data.fontColor};
                                                font:${this.data.fontFamily};
                                                fontSize:${this.data.fontSize};
                                                depthOffset:1;
                                                maxWidth:${this.guiItem.width / 1.05};
                                                `);
            textEntity.setAttribute('position', `${textEntityX} 0 0.05`);

            //        textEntity.setAttribute('troika-text-material', `shader: flat;`);
            this.el.appendChild(textEntity);
        }


    });

    AFRAME.registerPrimitive('a-gui-radio', {
        defaultComponents: {
            'gui-interactable': {},
            'gui-item': { type: 'radio' },
            'gui-radio': {}
        },
        mappings: {
            'onclick': 'gui-interactable.clickAction',
            'onhover': 'gui-interactable.hoverAction',
            'key-code': 'gui-interactable.keyCode',
            'width': 'gui-item.width',
            'height': 'gui-item.height',
            'show': 'guid-radio.show',
            'margin': 'gui-item.margin',
            'on': 'gui-radio.on',
            'value': 'gui-radio.value',
            'active': 'gui-radio.active',
            'checked': 'gui-radio.checked',
            'font-color': 'gui-radio.fontColor',
            'font-size': 'gui-radio.fontSize',
            'font-family': 'gui-radio.fontFamily',
            'border-color': 'gui-radio.borderColor',
            'background-color': 'gui-radio.backgroundColor',
            'hover-color': 'gui-radio.hoverColor',
            'active-color': 'gui-radio.activeColor',
            'handle-color': 'gui-radio.handleColor',
            'radiosizecoef': 'gui-radio.radiosizecoef'
        }
    });
}