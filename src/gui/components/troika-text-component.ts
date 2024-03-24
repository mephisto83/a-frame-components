import { Text } from 'troika-three-text'
import { AFRAME } from "../../react/root";
import { getCaretAtPoint } from "troika-three-text";
import { key_orange, key_offwhite, key_grey, key_white, key_grey_light } from "../vars";
const THREE: any = (window as any).THREE;

export var COMPONENT_NAME = 'troika-text'
export default function () {
    function numberOrPercent(defaultValue) {
        return {
            default: defaultValue,
            parse: function (value) {
                if (typeof value === 'string' && value.indexOf('%') > 0) {
                    return value
                }
                value = +value
                return isNaN(value) ? 0 : value
            },
            stringify: function (value) {
                return '' + value
            }
        }
    }

    AFRAME.registerComponent(COMPONENT_NAME, {
        schema: {
            align: { type: 'string', default: 'left', oneOf: ['left', 'right', 'center', 'justify'] },
            anchor: { default: 'center', oneOf: ['left', 'right', 'center', 'align'] },
            baseline: { default: 'center', oneOf: ['top', 'center', 'bottom'] },
            clipRect: {
                type: 'string',
                default: '',
                parse: function (value) {
                    if (value) {
                        value = value.split(/[\s,]+/).reduce(function (out, val) {
                            val = +val
                            if (!isNaN(val)) {
                                out.push(val)
                            }
                            return out
                        }, [])
                    }
                    return value && value.length === 4 ? value : null
                },
                stringify: function (value) {
                    return value ? value.join(' ') : ''
                }
            },
            beingEdited: { type: 'boolean', default: false },
            color: { type: 'color', default: '#FFF' },
            cursorPosition: { type: 'number', default: 0 },
            colorRanges: { // experimental
                type: 'string',
                default: null,
                parse: function (value) {
                    return typeof value === 'string' ? JSON.parse(value) : value
                },
                stringify: JSON.stringify
            },
            curveRadius: { type: 'number', default: 0 },
            depthOffset: { type: 'number', default: 0 },
            direction: { type: 'string', default: 'auto', oneOf: ['auto', 'ltr', 'rtl'] },
            fillOpacity: { type: 'number', default: 1 },
            font: { type: 'string' },
            fontSize: { type: 'number', default: 0.2 },
            letterSpacing: { type: 'number', default: 0 },
            lineHeight: { type: 'number' },
            maxWidth: { type: 'number', default: Infinity },
            outlineBlur: numberOrPercent(0),
            outlineColor: { type: 'color', default: '#000' },
            outlineOffsetX: numberOrPercent(0),
            outlineOffsetY: numberOrPercent(0),
            outlineOpacity: { type: 'number', default: 1 },
            outlineWidth: numberOrPercent(0),
            overflowWrap: { type: 'string', default: 'normal', oneOf: ['normal', 'break-word'] },
            strokeColor: { type: 'color', default: 'grey' },
            strokeOpacity: { type: 'number', default: 1 },
            strokeWidth: numberOrPercent(0),
            textIndent: { type: 'number', default: 0 },
            value: { type: 'string' },
            whiteSpace: { default: 'normal', oneOf: ['normal', 'nowrap'] }

            // attrs that can be configured via troika-text-material:
            // opacity: {type: 'number', default: 1.0},
            // transparent: {default: true},
            // side: {default: 'front', oneOf: ['front', 'back', 'double']},
        },

        /**
         * Called once when component is attached. Generally for initial setup.
         */
        init: function () {
            let me = this;
            // If we're being applied as a component attached to a generic a-entity, create an
            // anonymous sub-entity that we can use to isolate the text mesh and the material
            // component that should apply to it. If we're a primitive, no isolation is needed.
            var textEntity
            var isPrimitive = this.el.tagName.toLowerCase() === 'frame-troika-text'
            if (isPrimitive) {
                textEntity = this.el
            } else {
                textEntity = document.createElement('a-entity')
                this.el.appendChild(textEntity)
            }
            this.troikaTextEntity = textEntity
            // Create Text mesh and add it to the entity as the 'mesh' object
            var textMesh = this.troikaTextMesh = new Text()
            // Create a THREE.Group and add the Text mesh to it
            var group = new THREE.Group();
            group.add(textMesh);
            // textEntity.setObject3D('mesh', textMesh)

            textMesh._needsSync = true;
            textMesh.sync(() => {
                if (textMesh?.textRenderInfo) {
                    this.setRenderInfo(textMesh.textRenderInfo);
                    if (this.data.beingEdited) {
                        me.placeCursor()
                    }
                }
                this.troikaTextEntity.setObject3D('mesh', group);
            });
        },
        placeCursor: function () {
            if (!this.textCursor) {
                let scaleX = .01
                this.textCursor = document.createElement('a-plane');
                this.textCursor.setAttribute('material', 'color', `#ffffff`);
                this.textCursor.setAttribute('position', '0 0 0.02');
                this.textCursor.setAttribute('scale', scaleX + ' .1 1');
                this.textCursor.setAttribute('rotation', '0 0 0');
                this.textCursor.setAttribute('flashing', {});
                this.el.appendChild(this.textCursor);
            }
            this.positionCaret();
        },
        positionCaret: function () {
            let me = this;
            if (this.textCursor) {
                let caretPositions = this.getCaretPositions();
                if (caretPositions) {
                    let scaleX = .025
                    let x_ = this.caretIndex * 4;
                    let y_ = this.caretIndex * 4 + 3;
                    if (me?.troikaTextMesh?.geometry?.boundingBox) {
                        me.el.emit('bounding-box-update', {
                            box: me.troikaTextMesh.geometry.boundingBox
                        })
                    }
                    if (caretPositions.length === x_) {
                        x_ = (this.caretIndex - 1) * 4 + 1;
                        y_ = (this.caretIndex - 1) * 4 + 3;

                    }
                    if (x_ < caretPositions.length && x_ >= 0 &&
                        y_ < caretPositions.length && y_ >= 0) {
                        let x = caretPositions[x_];
                        let y = caretPositions[y_];
                        this.textCursor.setAttribute('position', `${(x || 0) + scaleX} ${y || 0} 0.02`);
                    }
                }
            }
        },
        setRenderInfo: function (renderInfo) {
            this.renderInfo = renderInfo;
        },
        getFontSize: function () {
            if (this.renderInfo) {
                this.renderInfo?.parameters?.fontSize;
            }
            return null;
        },
        getCaretPositions: function () {
            if (this.troikaTextMesh) {
                return this.troikaTextMesh?.textRenderInfo?.caretPositions || null;
            }
            return null;
        },

        /**
         * Called when component is attached and when component data changes.
         * Generally modifies the entity based on the data.
         */
        update: function () {
            let me = this;
            var data = this.data
            var mesh = this.troikaTextMesh
            var entity = this.troikaTextEntity
            var font = data.font

            // Update the text mesh
            mesh.text = (data.value || '')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
            mesh.textAlign = data.align

            // Retrieve font path if preloaded in <a-assets> with unique id
            if (data.font.startsWith('#')) {
                const assetItem = document.querySelector(data.font);
                font = assetItem.getAttribute('src');
            }
            this.caretIndex = this.data.cursorPosition;
            mesh.anchorX = anchorMapping[data.anchor === 'align' ? data.align : data.anchor] || 'center'
            mesh.anchorY = baselineMapping[data.baseline] || 'middle'
            mesh.color = data.color
            mesh.colorRanges = data.colorRanges
            mesh.clipRect = data.clipRect
            mesh.curveRadius = data.curveRadius
            mesh.depthOffset = data.depthOffset || 0
            mesh.direction = data.direction
            mesh.fillOpacity = data.fillOpacity
            mesh.font = font //TODO allow AFRAME stock font names
            mesh.fontSize = data.fontSize
            mesh.letterSpacing = data.letterSpacing || 0
            mesh.lineHeight = data.lineHeight || 'normal'
            mesh.outlineBlur = data.outlineBlur
            mesh.outlineColor = data.outlineColor
            mesh.outlineOffsetX = data.outlineOffsetX
            mesh.outlineOffsetY = data.outlineOffsetY
            mesh.outlineOpacity = data.outlineOpacity
            mesh.outlineWidth = data.outlineWidth
            mesh.overflowWrap = data.overflowWrap
            mesh.strokeColor = data.strokeColor
            mesh.strokeOpacity = data.strokeOpacity
            mesh.strokeWidth = data.strokeWidth
            mesh.textIndent = data.textIndent
            mesh.whiteSpace = data.whiteSpace
            mesh.maxWidth = data.maxWidth
            mesh._needsSync = true;
            mesh.sync(() => { });

            this.positionCaret();
            // Pass material config down to child entity
            if (entity !== this.el) {
                var materialAttr = this.el.getAttribute('troika-text-material')
                if (materialAttr) {
                    entity.setAttribute('material', materialAttr)
                } else {
                    entity.removeAttribute('material')
                }
            }
        },

        /**
         * Called when a component is removed (e.g., via removeAttribute).
         * Generally undoes all modifications to the entity.
         */
        remove: function () {
            // Free memory
            this.troikaTextMesh.dispose()

            // If using sub-entity, remove it
            if (this?.troikaTextEntity?.parentNode) {
                this.troikaTextEntity.parentNode.removeChild(this.troikaTextEntity)
            }
        }

    })


    var anchorMapping = {
        'left': 'left',
        'center': 'center',
        'right': 'right'
    }
    var baselineMapping = {
        'top': 'top',
        'center': 'middle',
        'bottom': 'bottom'
    }



    var mappings = {}

    // From AFRAME's primitives.js utilities...
    var schema = AFRAME.components[COMPONENT_NAME].schema
    Object.keys(schema).map(function (prop) {
        // Hyphenate where there is camelCase.
        var attrName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        mappings[attrName] = COMPONENT_NAME + '.' + prop;
    });


    AFRAME.registerPrimitive('frame-troika-text', {
        defaultComponents: {
            'troika-text': {}
        },
        mappings: mappings
    })
}