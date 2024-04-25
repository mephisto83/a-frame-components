export function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function setConsoleText(message, selector) {
    const consoleElement = document.querySelector(selector);
    if (consoleElement) {
        consoleElement.setAttribute('value', message); // Update text
    }
}
/**
 * Draws an image (texture) onto a canvas.
 * 
 * @param canvasId The ID of the canvas element.
 * @param imageUrl The URL of the image to be drawn.
 */
export async function drawTextureOnCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, imageUrl: string): Promise<void> {
    if (!canvas) {
        console.log('Canvas element not found')
        throw new Error('Canvas element not found');
    }

    if (!context) {
        console.log('Unable to get canvas context')
        throw new Error('Unable to get canvas context');
    }

    // Load the image asynchronously
    console.log(`// Load the image asynchronously`)
    const image = new Image();
    image.crossOrigin = 'anonymous'
    image.src = imageUrl;
    console.log(`imageUrl: ${imageUrl}`)
    console.log(`// loading image`)
    await new Promise((resolve, reject) => {
        image.onload = () => {
            setTimeout(() => {
                resolve(true);
            }, 100)
        };
        image.onerror = reject;
    });
    console.log(`// draw image on canvas`)
    // Draw the image onto the canvas
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

/**
 * Removes a specified substring from a given string.
 * 
 * @param originalString - The original string.
 * @param stringToRemove - The substring to remove.
 * @returns The modified string with the substring removed.
 */
export function removeSubstring(originalString: string, stringToRemove: string): string {
    return originalString.replace(stringToRemove, '');
}

/**
 * Dispatches a custom event with a specified name and details.
 * 
 * @param eventName The name of the custom event.
 * @param detail The data to be attached to the event's 'detail' property.
 */
export function raiseCustomEvent<T>(eventName: string, detail: T, canvasLayer?: any, opts?: any): void {
    // Create a custom event with the given name and detail
    const event = new CustomEvent<T>(eventName, { detail, bubbles: true, ...(opts || {}) });
    // Dispatch the event on the window object or another suitable target
    if (canvasLayer) {
        canvasLayer.dispatchEvent(event);
    }
    else {
        document.body.dispatchEvent(event);
    }
}


export const Utils = (function () {
    const DIGITS = 6;
    function numberToFixed(number) {
        return parseFloat(number.toFixed(DIGITS));
    }

    async function loadJSON(filePath) {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }

    function arrayNumbersToFixed(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = numberToFixed(array[i]);
        }
        return array;
    }

    function getTooltips(controllerName) {
        var tooltips;
        var tooltipName;
        switch (controllerName) {
            case 'windows-motion-samsung-controls': {
                tooltipName = '.windows-motion-samsung-tooltips';
                break;
            }
            case 'windows-motion-controls': {
                tooltipName = '.windows-motion-tooltips';
                break;
            }
            case 'oculus-touch-controls': {
                tooltipName = '.oculus-tooltips';
                break;
            }
            case 'vive-controls': {
                tooltipName = '.vive-tooltips';
                break;
            }
            default: {
                tooltipName = '.vive-tooltips';
                break;
            }
        }

        tooltips = Array.prototype.slice.call(document.querySelectorAll(tooltipName));
        return tooltips;
    }

    return {
        numberToFixed: numberToFixed,
        arrayNumbersToFixed: arrayNumbersToFixed,
        getTooltips: getTooltips,
        loadJSON
    }
}());


export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function hsb2rgb(hsb: [number, number, number]): [number, number, number] {
    const [h, s, b] = hsb;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = b * (1 - s);
    const q = b * (1 - f * s);
    const t = b * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: return [b, t, p];
        case 1: return [q, b, p];
        case 2: return [p, b, t];
        case 3: return [p, q, b];
        case 4: return [t, p, b];
        case 5: return [b, p, q];
    }
}

function componentToHex(c: number): string {
    const hex = Math.floor(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
export function rgbToHex(rgb: [number, number, number]): string {
    const [r, g, b] = rgb.map(componentToHex);
    return `#${r}${g}${b}`;
}
export function rgb2hsv(r, g, b) {
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h;
    var s = (max === 0 ? 0 : d / max);
    var v = max;

    if (arguments.length === 1) { g = r.g; b = r.b; r = r.r; }

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }
    return { h: h, s: s, v: v };
}


export function getRgbFromPosition(x: number, y: number, brightness: number = 1.0): string {
    const toCenter = [x, y];
    const angle = Math.atan2(toCenter[1], toCenter[0]);
    const radius = Math.sqrt(toCenter[0] * toCenter[0] + toCenter[1] * toCenter[1]) * 2.0;
    const hue = (angle / Math.PI / 2) + 0.5;
    const rgb = hsb2rgb([hue, radius, brightness]);
    return rgbToHex(rgb);
}

export function limitToUnitCircle(x: number, y: number): [number, number] {
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
        // Normalize the vector if it's outside the unit circle
        return [x / distance, y / distance];
    } else {
        // Return the original coordinates if they're inside the unit circle
        return [x, y];
    }
}
type HSVColor = {
    h: number;
    s: number;
    v: number;
};

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsv(r: number, g: number, b: number): HSVColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number;
    let s: number;
    let v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h, s, v };
}

export function hexToHsv(hex: string): HSVColor {
    const rgb = hexToRgb(hex);
    if (rgb) {
        return rgbToHsv(rgb.r, rgb.g, rgb.b);
    }
}

export type Point = {
    x: number;
    y: number;
};
export function uvToUnitCircle(u: number, v: number): Point {
    // Map UV coordinates (0 to 1) to Cartesian coordinates (-1 to 1)
    const x = 2 * u - 1;
    const y = 2 * v - 1;

    // Calculate the length of the vector
    const length = Math.sqrt(x * x + y * y);

    // Normalize the vector to put it on the edge of the unit circle if it's outside the circle
    return length <= 1 ? { x, y } : { x: x / length, y: y / length };
}

export function uvToColorHex(u: number, v: number, brightness: number): string {
    // Convert UV to HSB
    const toCenter = { x: 0.5 - u, y: 0.5 - v };
    const angle = Math.atan2(toCenter.y, toCenter.x);
    const radius = Math.min(Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y) * 2, 1);
    const hue = (angle / (2 * Math.PI)) + 0.5;

    // HSB to RGB conversion
    const rgb = hsb2rgb2({ h: hue, s: radius, b: brightness });

    // RGB to Hex conversion
    return rgbToHex2(rgb.r, rgb.g, rgb.b);
}

// Helper function to convert HSB to RGB
function hsb2rgb2(hsb: { h: number, s: number, b: number }) {
    const h = hsb.h * 6;
    const s = hsb.s;
    const b = hsb.b;
    const i = Math.floor(h);
    const f = h - i;
    const p = b * (1 - s);
    const q = b * (1 - s * f);
    const t = b * (1 - s * (1 - f));

    let r = 0;
    let g = 0;
    let b_ = 0;
    switch (i % 6) {
        case 0: r = b; g = t; b_ = p; break;
        case 1: r = q; g = b; b_ = p; break;
        case 2: r = p; g = b; b_ = t; break;
        case 3: r = p; g = q; b_ = b; break;
        case 4: r = t; g = p; b_ = b; break;
        case 5: r = b; g = p; b_ = q; break;
    }
    return { r, g, b: b_ };
}
export function findGrayByPercentage(percentage: number): string {
    // Ensure the percentage is between 0 and 1
    const validPercentage = Math.max(0, Math.min(1, percentage));

    // Interpolate between black (0) and white (255) based on the percentage
    const grayValue = Math.round(validPercentage * 255);

    // Convert the RGB values to a hex color string
    return rgbToHex3(grayValue, grayValue, grayValue);
}

function rgbToHex3(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Helper function to convert RGB to Hex
function rgbToHex2(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).slice(1);
}
