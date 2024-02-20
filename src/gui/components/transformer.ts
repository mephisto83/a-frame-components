import { AFRAME } from "../../painter/root";
import interactionMixin from "../../painter/components/interaction-mixin";
import { PAINTER_CONSTANTS } from "../../painter/constants";
import { raiseCustomEvent } from "../../painter/util";

type Point = {
    x: number;
    y: number;
};
type Vector = Point;
export class Transformation {
    private scale: Vector;
    private scaleChange: Vector;
    private scaleChanged: boolean;
    private rotate: number; // In radians
    private rotateChange: number; // In radians
    private rotateChanged: boolean;
    private translation: Vector;
    private translationChange: Vector;
    private translationChanged: boolean;
    constructor() {
        this.scale = { x: 1, y: 1 }; // Default scale is 1 for both x and y
        this.scaleChange = { x: 0, y: 0 }
        this.rotate = 0; // Default rotation
        this.rotateChange = 0;
        this.translation = { x: 0, y: 0 }; // Default translation
        this.translationChange = { x: 0, y: 0 };
        this.translationChanged = false;
    }

    // Scale getters and setters
    getScale(): Vector {
        return this.scale;
    }
    getScaleChange(): Vector {
        return this.scaleChange;
    }
    setScale(vector: Vector): void {
        this.scale = vector;
    }
    hasScaled(): boolean {
        return this.scaleChanged;
    }
    addScaleChange(vector: Vector): void {
        this.scaleChange = vector;
        this.scaleChanged = true;
    }
    applyScaleChange(): void {
        if (this.scaleChange) {
            this.scale.x += this.scaleChange.x;
            this.scale.y += this.scaleChange.y;
            this.scaleChange = { x: 0, y: 0 }; // Default scale is 1 for both x and y
            this.scaleChanged = false;
        }
    }

    // Rotation getters and setters
    getRotate(): number {
        return this.rotate;
    }
    getRotateChange(): number {
        return this.rotateChange;
    }
    setRotate(angle: number): void {
        this.rotate = angle;
    }
    hasRotated(): boolean {
        return this.rotateChanged;
    }
    addRotateChange(angle: number): void {
        this.rotateChange = angle;
        this.rotateChanged = true;
    }
    applyRotateChange(): void {
        if (this.rotateChange) {
            this.rotate += this.rotateChange;
            this.rotateChange = 0;
            this.rotateChanged = false;
        }
    }

    // Translation getters and setters
    getTranslation(): Vector {
        return this.translation;
    }
    getTranslationChange(): Vector {
        return this.translationChange;
    }
    setTranslation(vector: Vector): void {
        this.translation = vector;
    }
    hasTranslated(): boolean {
        return this.translationChanged;
    }
    addTranslationChange(vector: Vector): void {
        this.translationChange = vector;
        this.translationChanged = true;
    }
    applyTranslationChange(): void {
        if (this.translationChange) {
            this.translation.x += this.translationChange.x;
            this.translation.y += this.translationChange.y;
            this.translationChange = { x: 0, y: 0 };
            this.translationChanged = false;
        }
    }
    previewChange({ transform }: { transform?: number }): {
        translation: Vector,
        scale: Vector,
        rotate: number
    } {
        transform = transform || 1;
        return {
            translation: {
                x: transform * (this.translation.x + this.translationChange.x),
                y: transform * (this.translation.y + this.translationChange.y)
            },
            scale: {
                x: this.scale.x + this.scaleChange.x,
                y: this.scale.y + this.scaleChange.y
            },
            rotate: this.rotate + this.rotateChange
        }
    }
    // Method to apply all changes
    applyAllChanges(): void {
        this.applyScaleChange();
        this.applyRotateChange();
        this.applyTranslationChange();
    }
    transformPoint(point: Vector): Vector {
        // Apply scale
        let scaleX = this.scale.x + this.scaleChange.x;
        let scaleY = this.scale.y + this.scaleChange.y;
        let transformedX = point.x * scaleX;
        let transformedY = point.y * scaleY;

        // Apply rotation
        let rotate = this.rotate + this.rotateChange;
        const cosTheta = Math.cos(rotate);
        const sinTheta = Math.sin(rotate);
        const rotatedX = transformedX * cosTheta - transformedY * sinTheta;
        const rotatedY = transformedX * sinTheta + transformedY * cosTheta;

        // Apply translation
        let translationX = this.translation.x + this.translationChange.x;
        let translationY = this.translation.y + this.translationChange.y;
        transformedX = rotatedX + translationX;
        transformedY = rotatedY + translationY;

        return { x: transformedX, y: transformedY };
    }
}

export default function () {
    const THREE: any = (window as any).THREE;
    AFRAME.registerComponent('gui-transformer', {
        schema: {
            src: { type: 'string', default: 'assets/images/green_white_ghost.png' },
            size: { type: 'number', default: 1 },
            handlesize: { type: 'number', default: .03 },
        },
        init: function () {
            let handles = [];
            let el = this.el;
            let me = this;
            var system = this.el.sceneEl.systems.ui; // Access by system name
            this.system = system;
            this.planeScaleX = 5;
            this.planeScaleY = 3;
            me.transformer = new Transformation();
            let componentContainer = document.createElement('a-entity');
            let rotateArc = document.createElement('a-gui-slider');
            rotateArc.setAttribute('position', `1 0 .1`)
            rotateArc.setAttribute('rotation', `0 0 90`)
            rotateArc.setAttribute('targetbarsize', '.5');
            rotateArc.setAttribute('width', '2');
            rotateArc.addEventListener('change', (evt: any) => {
                let { value } = evt.detail;

                let transformer: Transformation = me.transformer;
                transformer.setRotate(Math.PI * 2 * value);
                raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })
                me.positionElements();
            })

            let horizontalScale = document.createElement('a-gui-slider');
            horizontalScale.setAttribute('position', `-1 0 .1`)
            horizontalScale.setAttribute('rotation', `0 0 90`)
            horizontalScale.setAttribute('targetbarsize', '.5');
            horizontalScale.setAttribute('width', '2');
            let maxScale = 4;
            horizontalScale.addEventListener('change', (evt: any) => {
                let { value } = evt.detail;

                let transformer: Transformation = me.transformer;
                transformer.setScale({ x: maxScale * (value - .5), y: transformer.getScale().y });
                raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })
                me.positionElements();
            });

            let verticalScale = document.createElement('a-gui-slider');
            verticalScale.setAttribute('position', `0 -1 .1`)
            verticalScale.setAttribute('rotation', `0 0 0`)
            verticalScale.setAttribute('targetbarsize', '.5');
            verticalScale.setAttribute('width', '2');
            verticalScale.addEventListener('change', (evt: any) => {
                let { value } = evt.detail;
                let transformer: Transformation = me.transformer;
                transformer.setScale({ y: maxScale * (value - .5), x: transformer.getScale().x });
                raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })
                me.positionElements();
            });

            componentContainer.appendChild(verticalScale);
            componentContainer.appendChild(horizontalScale);
            componentContainer.appendChild(rotateArc);
            el.appendChild(componentContainer)

            me.componentContainer = componentContainer;
            let size = this.data.size / 3;
            me.scaleTransformer = me.scaleTransformer.bind(this);
            me.translateTransformer = me.translateTransformer.bind(this);
            me.rotateTransformer = me.rotateTransformer.bind(this);
            let rotate_handle = this.createHandle();
            rotate_handle.setAttribute('position', `${0} ${2 * size} 0`);
            rotate_handle.addEventListener('mouseup', stopStretching);
            rotate_handle.addEventListener('mousedown', gethandler(me.rotateTransformer))
            handles.push({
                i: 0,
                j: 2,
                handle: rotate_handle
            });

            el.appendChild(rotate_handle);
            // <a-entity line="start: 0 0 0; end: 5 5 5; color: red;"></a-entity>
            let linesconfigs = [
                [{ x: -1, y: -1 }, { x: -1, y: 1 }],
                [{ x: 1, y: -1 }, { x: 1, y: 1 }],
                [{ x: -1, y: -1 }, { x: 1, y: -1 }],
                [{ x: -1, y: 1 }, { x: 1, y: 1 }],
                [{ x: 0, y: 1 }, { x: 0, y: 2 }]
            ]
            let lines = linesconfigs.map((config) => {
                let res = this.buildLine(config, size);
                el.appendChild(res.line);
                return res;
            })
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    let handle = this.createHandle(i == 0 && j == 0 ? 2 : 1, i == 0 && j == 0);
                    handle.setAttribute('position', `${i * size} ${j * size} 0`)
                    handles.push({
                        i,
                        j,
                        handle
                    });
                    el.appendChild(handle);
                    let handler: any = null;
                    if (Math.abs(i) == 1 || Math.abs(j) == 1) {
                        handler = me.scaleTransformer;
                    }
                    else if (Math.abs(i) == 0 || Math.abs(j) == 0) {
                        handler = me.translateTransformer;
                    }
                    else if (Math.abs(i) === 2 || Math.abs(j) === 2) {
                        handler = me.rotateTransformer;
                    }
                    if (handler) {
                        handle.addEventListener('mouseup', stopStretching);
                        handle.addEventListener('mousedown', gethandler(handler))
                    }
                }
            }
            this.lines = lines;
            this.handles = handles;
            function stopStretching() {
                if (me.strechPlane) {
                    me.strechPlane.parentNode.removeChild(me.strechPlane)
                    me.strechPlane = null;
                    me.interactingRaycaster = null;
                    me.transforming = false;
                    let transformer: Transformation = me.transformer;
                    transformer.applyAllChanges();
                    // me.resetTransformer();
                }
            }
            function gethandler(handler) {
                return (evt) => {
                    stopStretching();
                    me.transforming = true;
                    me.scaleInitialPoint = null;
                    me.transformInitialPoint = null;
                    me.interactingRaycaster = null;
                    let planeEntity: any = document.createElement('a-plane');
                    planeEntity.setAttribute('material', 'color', `#ffffff`);
                    planeEntity.setAttribute('gui-interactable', 'true');
                    planeEntity.setAttribute('opacity', '0');
                    planeEntity.setAttribute('scale', `${me.planeScaleX} ${me.planeScaleY} 1`);
                    planeEntity.setAttribute('position', `0 0 -.1`);
                    me.strechPlane = planeEntity;
                    me.strechPlane.addEventListener('mouseout', stopStretching)
                    me.strechPlane.addEventListener('mouseup', stopStretching)
                    me.setupRayListener(planeEntity, 'scale', handler)
                    el.appendChild(me.strechPlane);
                }
            }
        },
        buildLine: function (config, size) {
            let line1: any = document.createElement('a-entity');
            line1.setAttribute('line', `start:${config[0].x * size} ${config[0].y * size} 0;end:${config[1].x * size} ${config[1].y * size} 0;color:white;`)
            return {
                line: line1,
                config
            }
        },
        rotateTransformer: function (args) {
            let me = this;
            if (me.transforming)
                if (this.system) {
                    if (!me.interactingRaycaster) {
                        me.interactingRaycaster = args.raycaster;
                    }
                    else if (me.interactingRaycaster !== args.raycaster) {
                        return;
                    }
                    let size = this.data.size / 3;
                    const { x, y, } = args;
                    let positionX = (x - .5) * me.planeScaleX
                    let positionY = ((1 - y) - .5) * me.planeScaleY;
                    let transformer: Transformation = me.transformer;
                    let rotation = transformer.getRotate();
                    if (!transformer.hasRotated() || !me.transformInitialPoint) {
                        transformer.addRotateChange(0)
                        me.transformInitialPoint = { x: positionX, y: positionY }
                        if (false)
                            raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_ROTATION, { value: 0, reset: true })
                    }
                    else {

                        let radians = calculateFullAngle(me.transformInitialPoint, { x: positionX, y: positionY })
                        let change = radians
                        transformer.addRotateChange(change);
                        raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })

                        me.positionElements();
                    }
                }

        },
        resetTransformer: function () {
            let me = this;
            let size = me.data.size / 3;

            me.handles.forEach(({ i, j, handle }) => {
                let rotated = { x: i * size, y: j * size };
                let { x, y } = rotated;
                handle.setAttribute('position', `${x} ${y} 0`)
            });
            me.lines.forEach(({ config, line }) => {
                let point1 = { x: config[0].x * size, y: config[0].y * size };
                let point2 = { x: config[1].x * size, y: config[1].y * size };

                line.setAttribute('line', `start:${point1.x} ${point1.y} 0;end:${point2.x} ${point2.y} 0;color:white;`)
            })
        },
        translateTransformer: function (args) {
            let me = this;
            if (me.transforming)
                if (this.system) {
                    if (!me.interactingRaycaster) {
                        me.interactingRaycaster = args.raycaster;
                    }
                    else if (me.interactingRaycaster !== args.raycaster) {
                        return;
                    }
                    const { x, y, } = args;
                    let positionX = (x - .5) * me.planeScaleX
                    let positionY = ((1 - y) - .5) * me.planeScaleY
                    let transformer: Transformation = me.transformer;
                    let translation = transformer.getTranslation();
                    if (!transformer.hasTranslated()) {
                        transformer.addTranslationChange({ x: positionX, y: positionY })
                        if (false)
                            raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_TRANSLATION, { value: { x: 0, y: 0 }, reset: true })
                    }
                    else {
                        let change = calculateChange(translation, { x: positionX, y: positionY })
                        transformer.addTranslationChange(change);
                        raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })
                        me.positionElements();
                    }
                }

        },
        positionElements: function () {
            let me = this;
            let size = this.data.size / 3;
            let transformer: Transformation = me.transformer;
            let change = transformer.transformPoint({
                x: 0, y: 0
            });
            me.handles.forEach(({ i, j, handle }) => {
                let { x, y } = transformer.transformPoint({
                    x: i * size, y: j * size
                });
                handle.setAttribute('position', `${x} ${y} 0`)
            });
            me.componentContainer.setAttribute('position', `${change.x} ${change.y} 0`)
            me.lines.forEach(({ config, line }) => {
                let point1 = transformer.transformPoint({ x: config[0].x * size, y: config[0].y * size });
                let point2 = transformer.transformPoint({ x: config[1].x * size, y: config[1].y * size });
                line.setAttribute('line', `start:${point1.x} ${point1.y} 0;end:${point2.x} ${point2.y} 0;color:white;`)
            })
        },
        scaleTransformer: function (args) {
            let me = this;
            if (me.transforming)
                if (this.system) {
                    if (!me.interactingRaycaster) {
                        me.interactingRaycaster = args.raycaster;
                    }
                    else if (me.interactingRaycaster !== args.raycaster) {
                        return;
                    }
                    const { x, y, } = args;
                    let scaleX = (x - .5)
                    let scaleY = (y - .5)
                    let transformer: Transformation = me.transformer;
                    if (!transformer.hasScaled() || !me.scaleInitialPoint) {
                        if (scaleX == 0 || scaleY == 0) {
                            me.scaleInitialPoint = null;
                        }
                        else {
                            transformer.addScaleChange({ x: 0, y: 0 });
                            me.scaleInitialPoint = { x: scaleX, y: scaleY }
                        }
                    }
                    else {
                        if (scaleX == 0 || scaleY == 0) {
                            return;
                        }
                        let scaling = calculateScaleFactors(me.scaleInitialPoint.x, me.scaleInitialPoint.y, scaleX, scaleY)
                        transformer.addScaleChange(scaling);
                        raiseCustomEvent(PAINTER_CONSTANTS.TRANSFORMER_CHANGE, { transformer })

                        me.positionElements();
                    }
                }
        },
        ...interactionMixin,
        createHandle: function (size, useHandle) {
            var data = this.data;  // Component data

            if (useHandle) {
                let entity = document.createElement('a-gui-handle');
                return entity;
            }

            // Create geometry for the cube
            var geometry = new THREE.BoxGeometry(data.handlesize * size, data.handlesize * size, data.handlesize * size);

            // Create material with the image texture for each side
            var materialArray = [];
            for (var i = 0; i < 6; i++) {
                materialArray.push(new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(data.src)
                }));
            }

            // Create the mesh and add it to the entity
            var cube = new THREE.Mesh(geometry, materialArray);
            let entity: any = document.createElement('a-entity');
            entity.setObject3D('mesh', cube);

            return entity;
        },
        update: function () {
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
    });

    AFRAME.registerPrimitive('a-gui-transformer', {
        defaultComponents: {
            'gui-interactable': {},
            'gui-item': { type: 'slider' },
            'gui-transformer': {}
        },
        mappings: {
        }
    });
    function calculateScaleFactors(x1: number, y1: number, x2: number, y2: number): Vector | null {
        if (x1 === 0 || y1 === 0) {
            console.error("Original x or y coordinate cannot be zero for scaling.");
            return null; // Return null or handle this case as appropriate for your application
        }

        let scaleX = x2 / x1;
        let scaleY = y2 / y1;
        return { x: scaleX, y: scaleY };
    }
    function scalePoint(x: number, y: number, scaleX: number, scaleY: number): { x: number, y: number } {
        let x2 = x * scaleX;
        let y2 = y * scaleY;
        return { x: x2, y: y2 };
    }
    function calculateChange(point1: Point, point2: Point): Point {
        let deltaX = point2.x - point1.x;
        let deltaY = point2.y - point1.y;
        return { x: deltaX, y: deltaY };
    }

    function dotProduct(vectorA: Vector, vectorB: Vector): number {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
    }

    function magnitude(vector: Vector): number {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2);
    }

    function calculateAngle(vectorA: Vector, vectorB: Vector): number {

        const dot = dotProduct(vectorA, vectorB);
        const magA = magnitude(vectorA);
        const magB = magnitude(vectorB);
        const cosTheta = dot / (magA * magB);

        // Return the angle in radians
        // Use Math.acos to get the arc cosine of the angle, which is in radians
        return Math.acos(cosTheta);
    }
    function calculateFullAngle(vectorA: Vector, vectorB: Vector): number {
        // Calculate the angle using atan2
        const angleRadians = Math.atan2(vectorB.y, vectorB.x) - Math.atan2(vectorA.y, vectorA.x);

        // Convert angle to range [0, 2π]
        return angleRadians >= 0 ? angleRadians : angleRadians + 2 * Math.PI;
    }


    function rotatePoint(point: Point, center: Point, angleRadians: number): Point {
        // Translate point to origin
        const xTranslated = point.x - center.x;
        const yTranslated = point.y - center.y;

        // Rotate point using rotation matrix
        const xRotated = xTranslated * Math.cos(angleRadians) - yTranslated * Math.sin(angleRadians);
        const yRotated = xTranslated * Math.sin(angleRadians) + yTranslated * Math.cos(angleRadians);

        // Translate point back
        const xNew = xRotated + center.x;
        const yNew = yRotated + center.y;

        return { x: xNew, y: yNew };
    }
}