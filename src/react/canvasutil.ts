export interface Point {
    x: number;
    y: number;
}

export interface BoundingBox {
    topLeft: Point;
    bottomRight: Point;
}

export function getBoundingBoxOfNonTransparentPixels(canvas: HTMLCanvasElement): BoundingBox | null {
    const context = canvas.getContext('2d');
    if (!context) {
        return null;
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    // Find minY (top edge)
    top_scan:
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 0) { // Non-transparent pixel
                minY = y;
                found = true;
                break top_scan;
            }
        }
    }

    // Find maxY (bottom edge)
    bottom_scan:
    for (let y = canvas.height - 1; y >= minY; y--) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 0) { // Non-transparent pixel
                maxY = y;
                break bottom_scan;
            }
        }
    }

    // Find minX (left edge)
    left_scan:
    for (let x = 0; x < canvas.width; x++) {
        for (let y = minY; y <= maxY; y++) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 0) { // Non-transparent pixel
                minX = x;
                found = true;
                break left_scan;
            }
        }
    }

    // Find maxX (right edge)
    right_scan:
    for (let x = canvas.width - 1; x >= minX; x--) {
        for (let y = minY; y <= maxY; y++) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 0) { // Non-transparent pixel
                maxX = x;
                break right_scan;
            }
        }
    }

    if (!found) {
        return null;
    }

    return {
        topLeft: { x: minX, y: minY },
        bottomRight: { x: maxX, y: maxY }
    };
}
