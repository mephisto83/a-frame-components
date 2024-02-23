type Coordinates = {
    x: number;
    y: number;
};

export default class CanvasTransformations {
    private scaleX: number;
    private scaleY: number;
    private rotate: number; // In radians
    private translateX: number;
    private translateY: number;
    private dragging: boolean;
    private startX: number;
    private startY: number;

    constructor() {
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotate = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.dragging = false;
        this.startX = 0;
        this.startY = 0;
    }

    setScale(scaleX: number, scaleY: number): void {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    setRotate(rotateRadians: number): void {
        this.rotate = rotateRadians;
    }

    setTranslate(translateX: number, translateY: number): void {
        this.translateX = translateX;
        this.translateY = translateY;
    }

    onMouseDown(startX: number, startY: number): void {
        this.startX = startX;
        this.startY = startY;
        this.dragging = true;
    }

    onTranslate(deltaX: number, deltaY: number): void {
        if (!this.dragging) return;

        this.setTranslate(this.translateX + deltaX, this.translateY + deltaY);
    }

    onScale(scaleX: number, scaleY: number): void {
        if (!this.dragging) return;

        this.setTranslate(this.scaleX + scaleX, this.scaleY + scaleY);
    }

    onRotation(rotateRadians: number): void {
        if (!this.dragging) return;

        this.setRotate(this.rotate + rotateRadians);
    }

    onMouseUp(): void {
        this.dragging = false;
    }

    applyTransformations(
        sourceCanvas: HTMLCanvasElement,
        targetCanvas: HTMLCanvasElement): void {
        let targetContext: CanvasRenderingContext2D = targetCanvas.getContext('2d');
        targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
        targetContext.save();
        targetContext.translate(this.translateX, this.translateY);
        targetContext.rotate(this.rotate);
        targetContext.scale(this.scaleX, this.scaleY);
        // Redraw the image or content
        // context.drawImage(...);
        targetContext.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
        targetContext.restore();
    }
}
