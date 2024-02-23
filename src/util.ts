export interface Container {
    height: number;
    width: number;
}

export interface Item {
    height: number;
    width: number;
}

export interface Margin {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface Result {
    positions: Position[];
    containerSize: Container;
}


export function createAndApplyAttributes(elementType: any, attributesStr: any) {
    const element = document.createElement(elementType);

    // Split the attributes string by spaces, considering quotes to correctly handle spaces within attribute values
    const attributes = attributesStr.match(/([^\s="']+="[^"]*"|[^ ]+)/g);

    attributes.forEach((attr: any) => {
        // Split each attribute by the first occurrence of "=" to separate the key and value
        let [key, value] = attr.split(/=(.+)/);

        // Remove quotes from around the value, if present
        value = value.replace(/^['"]|['"]$/g, '');

        // Special handling for JSON-like syntax, convert it to valid JSON by replacing single quotes with double quotes
        if (value.startsWith("{") && value.endsWith("}")) {
            value = value.replace(/'/g, '"');
        }

        // Try to parse JSON values (for objects or arrays), otherwise keep the value as is
        try {
            value = JSON.parse(value);
        } catch (e) {
            // Value is not JSON, do nothing
        }

        // Set the attribute on the element
        element.setAttribute(key, value);
    });

    return element;
}

export function createElement(elementType: any, attributesDic: { [str: string]: any }) {
    let element: any = null;
    return function (moreAttr?: { [str: string]: any }) {
        // Create the element
        element = element || document.createElement(elementType);

        // Split the attributes string by spaces, considering quotes to correctly handle spaces within attribute values

        Object.entries(attributesDic).forEach(attr => {
            // Split each attribute by the first occurrence of "=" to separate the key and value
            let [key, value] = attr;

            // Set the attribute on the element
            element.setAttribute(key, value);
        });
        if (moreAttr) {
            Object.entries(moreAttr).forEach(attr => {
                // Split each attribute by the first occurrence of "=" to separate the key and value
                let [key, value] = attr;

                // Set the attribute on the element
                element.setAttribute(key, value);
            })
        }
        return element;
    }
}

export class Element implements Item {
    width: number;
    height: number;
    element: any;
    children: Element[];
    alignment: Alignment;
    direction: Direction;
    onRender: any;
    margin: Margin
    constructor({
        element,
        width,
        height,
        margin,
        alignment = 'flexStart',
        direction = 'horizontal',
        onRender
    }: {
        element: any,
        width: number,
        height: number,
        margin?: Margin,
        alignment?: Alignment,
        direction?: Direction,
        onRender?: any
    }) {
        this.element = element;
        this.alignment = alignment;
        this.direction = direction;
        this.width = width;
        this.height = height;
        this.children = [];
        this.onRender = onRender;
        this.margin = {
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            ...(margin || {})
        }
    }
    appendChild(...elements: Element[]) {
        this.children.push(...elements);
    }
    render(depth = 0) {
        let me = this;
        if (!this?.children?.length) {
            if (this.onRender) {
                this.onRender(this.element({}))
            }

            return {
                containerSize: {
                    width: this.width,
                    height: this.height
                },
                positions: [],
                element: this
            }
        }
        let items = this.children.map((element) => {
            return element.render(depth + 1);
        });
        const {
            containerSize,
            positions
        } = calculatePositionsAndContainerSize(items.map(t => t.containerSize), this.alignment, 'flexStart', this.direction, this.margin);
        let els = this.children.map((element, index) => {
            let pos = positions[index];
            return position(element, `${pos.x} ${pos.y} ${.02}`)
        })

        if (this.children.length) {
            this.width = containerSize.width;
            this.height = containerSize.height;
            let myEl = me.element({ width: me.width, height: me.height });
            els.forEach(el => {
                myEl.appendChild(el);
            });
        }
        if (this.onRender) {
            this.onRender(this.element({}))
        }

        return {
            containerSize,
            positions,
            element: this
        }
    }
}
export function position(element: Element, position: string) {
    let container = createElement('a-entity', { position: `${position}` });
    let el = new Element({
        element: container,
        height: element.height,
        width: element.width
    });
    let temp = el.element();
    temp.appendChild(element.element());
    return temp;
}
function defaultMargin() {
    return {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    }
}
export function createContainer(type = 'a-entity', attributes: any, margin?: Margin) {
    let element = createElement(type, attributes);
    return new Element({
        element,
        height: 0,
        width: 0,
        margin: { ...(defaultMargin()), ...(margin || {}) }
    });
}
export function createComponent(type = 'a-entity',
    attributes: any,
    height: any,
    width: any,
    margin?: Margin,
    onRender?: (el: any) => void) {
    let element = createElement(type, attributes);
    return new Element({
        element,
        height,
        width,
        margin: { ...(defaultMargin()), ...(margin || {}) },
        onRender
    });
}

export function createBaseInteractive({
    value,
    height = .4,
    width = .8,
    type = "button",
    fontSize = .17
}: any) {

    let element = createElement('a-base-interactive', {
        width,
        height,
        value,
        ['interactive-type']: type,
        ['font-size']: fontSize
    })
    return new Element({
        element,
        height,
        width
    });
}
export function createBaseIconInteractive({
    value = '',
    height = .4,
    width = .8,
    icon = 'f103',
    fontSize = .17,
    type = 'icon-button',
}) {
    let element = createElement('a-base-interactive', {
        width,
        height,
        value: value || icon,
        ['interactive-type']: type,
        ['font-size']: fontSize,
        margin: "0 0 0.05 0"
    })
    return new Element({
        element,
        height,
        width
    });
    //  return createAndApplyAttributes('a-base-interactive', `width="${width || .4}" height="${height || 0.4}" interactive-type="icon-button" value="${icon}" margin="0 0 0.05 0" font-size=".17"`)
}

export function onClick(el: any, func: any) {
    let handler = () => {
        if (func) {
            func();
        }
    };
    el.addEventListener('click', handler)
    return handler;
}
export function createMenuItem({ type, width = 1, text, onRender }: {
    width?: number,
    text: string,
    type?: string,
    onRender?: (el: any) => void
}) {
    let button = createElement("a-base-interactive",
        {
            width: width,
            ['interactive-type']: type || 'button',
            height: .2,
            value: text,
            ['font-size']: .07
        }
        //`width="1" interactive-type="button" height="0.2" value="${text}" margin="0 0 0.05 0" font-size=".07"`
    );
    return new Element({
        element: button,
        width: 1,
        height: .2,
        onRender
    });
}
export function createInteractiveButton({
    interactiveType,
    width,
    text,
    onRender
}: { interactiveType?: string, width?: any, text: string, onRender?: (el: any) => void }) {
    let button = createElement("a-base-interactive",
        {
            width: width || '1',
            ['interactive-type']: interactiveType || 'button',
            height: .2,
            value: text,
            ['font-size']: .07
        }
        //`width="1" interactive-type="button" height="0.2" value="${text}" margin="0 0 0.05 0" font-size=".07"`
    );
    return new Element({
        element: button,
        width: width || 1,
        height: .2,
        onRender
    });
}

export function createMenu({
    text = 'Menu',
    height = .2,
    width = 1,
    forwardStep = .01,
    children = []
}) {
    let menu = createElement('a-menu-container',
        {
            [`menu-direction`]: "up",
            [`flex-direction`]: "column",
            [`justify-content`]: "center",
            [`align-items`]: "center",
            [`component-padding`]: "0.01",
            ['forward-step']: forwardStep,
            width,
            [`text-value`]: text,
            [`menu-item-height`]: height,
            [`menu-item-width`]: width
        }
    )({});
    // menu.addEventListener('open-changed', (evt) => {
    //     const { detail } = evt;
    //     menu.setAttribute('open', !detail.open);
    // })
    // menu.addEventListener('close-menu', (evt) => {
    //     const { detail } = evt;
    //     menu.setAttribute('open', false);
    // })
    children.map((c: any) => {
        menu.appendChild(c.element({}));
        if (c.onRender) {
            c.onRender(c.element({}));
        }
    })

    return new Element({
        element: function () { return menu },
        height,
        width
    });
}
export type Alignment = 'flexStart' | 'flexEnd' | 'center';
export type Direction = 'vertical' | 'horizontal';
export type JustifyContent = 'flexStart' | 'center' | 'flexEnd';


export function calculatePositionsAndContainerSize(
    items: Item[],
    alignment: Alignment,
    justifyContent: JustifyContent, // This is used to determine the starting vertical position
    direction: Direction,
    margin: Margin
): Result {
    let maxContainerWidth = 0;
    let maxContainerHeight = 0;
    let totalSize = 0; // This will track the total size of items along the main axis

    // Calculate total container size and totalSize of items
    items.forEach((item, index) => {
        if (direction === 'vertical') {
            const effectiveWidth = item.width + margin.left + margin.right;
            maxContainerWidth = Math.max(maxContainerWidth, effectiveWidth);
            totalSize += item.height + (index < items.length - 1 ? margin.bottom : 0); // Adjusted for correct margin calculation
        } else { // 'horizontal'
            const effectiveHeight = item.height + margin.top + margin.bottom;
            maxContainerHeight = Math.max(maxContainerHeight, effectiveHeight);
            totalSize += item.width + (index < items.length - 1 ? margin.right : 0);
        }
    });

    // Adjust totalSize for final margin (only once, not per item)
    if (direction === 'vertical') {
        totalSize += margin.top; // Adjusted to add top margin
        maxContainerHeight = totalSize;
    } else {
        totalSize += margin.left; // Adjusted for horizontal direction
        maxContainerWidth = totalSize;
    }

    let currentPosition = 0;
    // Calculate starting position based on justifyContent
    if (justifyContent === 'center') {
        currentPosition = -(totalSize / 2); // Start from center and go both ways
    } else if (justifyContent === 'flexEnd') {
        currentPosition = -totalSize; // Start from bottom
    } else { // Default to flexStart or other cases
        currentPosition = 0; // Start from top
    }

    let positions: Position[] = [];

    // Adjust positions based on alignment and the total calculated container size
    items.forEach((item, index) => {
        let x: number;
        let y: number;

        if (direction === 'vertical') {
            // Calculate x based on alignment
            switch (alignment) {
                case 'flexStart':
                    x = margin.left + item.width / 2;
                    break;
                case 'flexEnd':
                    x = maxContainerWidth - margin.right - item.width / 2;
                    break;
                case 'center':
                    x = maxContainerWidth / 2;
                    break;
            }
            // Calculate y, starting from top and moving downwards
            y = currentPosition + margin.top + item.height / 2;
            currentPosition += item.height + margin.bottom;
        } else {
            // Horizontal direction logic remains unchanged
            switch (alignment) {
                case 'flexStart':
                    y = margin.top + item.height / 2;
                    break;
                case 'flexEnd':
                    y = maxContainerHeight - margin.bottom - item.height / 2;
                    break;
                case 'center':
                    y = maxContainerHeight / 2;
                    break;
            }
            x = currentPosition + margin.left + item.width / 2;
            currentPosition += item.width + margin.right;
        }

        positions.push({ x: x - (maxContainerWidth / 2), y: -y + (maxContainerHeight / 2) }); // Adjust y to invert direction
    });

    return {
        positions: positions,
        containerSize: {
            width: maxContainerWidth,
            height: maxContainerHeight
        }
    };
}


export function createText(text: any, { color, fontFamily }: any) {
    var textEntity = document.createElement("a-entity");
    textEntity.setAttribute('troika-text', `value: ${text}; 
                                        align:left; 
                                        anchor:left; 
                                        baseline:center;
                                        letterSpacing:0;
                                        color:${color};
                                        font:${fontFamily || "assets/fonts/Plaster-Regular.ttf"};
                                        fontSize:${'14px'};
                                        depthOffset:1;
                                        maxWidth:611;
                                        `);
    textEntity.setAttribute('position', `0 0 0.07`);
    textEntity.setAttribute('scale', `0.005 0.005 0.005`);
    return textEntity;
}

export function calculatePositionsAndContainerSize2(
    items: Item[],
    alignment: Alignment,
    direction: Direction,
    margin: Margin
): Result {
    let positions: Position[] = [];
    let maxContainerWidth = 0;
    let maxContainerHeight = 0;
    let currentPosition = 0;

    items.forEach((item, index) => {
        let x: number;
        let y: number;

        if (direction === 'vertical') {
            const effectiveWidth = item.width + margin.left + margin.right;
            switch (alignment) {
                case 'flexStart':
                    x = margin.left + item.width / 2;
                    break;
                case 'flexEnd':
                    x = effectiveWidth - margin.right - item.width / 2;
                    break;
                case 'center':
                    x = effectiveWidth / 2;
                    break;
            }
            y = currentPosition + margin.top + item.height / 2;
            currentPosition += item.height + (index === 0 ? margin.top : 0) + margin.bottom;
            maxContainerWidth = Math.max(maxContainerWidth, effectiveWidth);
            maxContainerHeight = currentPosition;
        } else { // 'horizontal'
            const effectiveHeight = item.height + margin.top + margin.bottom;
            switch (alignment) {
                case 'flexStart':
                    y = margin.top + item.height / 2;
                    break;
                case 'flexEnd':
                    y = effectiveHeight - margin.bottom - item.height / 2;
                    break;
                case 'center':
                    y = effectiveHeight / 2;
                    break;
            }
            x = currentPosition + margin.left + item.width / 2;
            currentPosition += item.width + (index === 0 ? margin.left : 0) + margin.right;
            maxContainerHeight = Math.max(maxContainerHeight, effectiveHeight);
            maxContainerWidth = currentPosition;
        }

        positions.push({ x, y });
    });

    // Adjust final container size to include the margin on the far side
    if (direction === 'vertical') {
        maxContainerHeight += margin.bottom; // Add bottom margin only once at the end
    } else { // 'horizontal'
        maxContainerWidth += margin.right; // Add right margin only once at the end
    }

    return {
        positions: positions,
        containerSize: {
            width: maxContainerWidth,
            height: maxContainerHeight
        }
    };
}

export const containerStlye: any = {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: 400,
    zIndex: 1000, // Ensure it's above other content
}

export const btnstyle: any = {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#007bff', // Bootstrap primary button color
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};