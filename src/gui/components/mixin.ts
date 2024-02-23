export default {
    getWidth: function () {
        return parseFloat(`${this.guiItem.width}`);
    },
    getHeight: function () {
        return parseFloat(`${this.guiItem.height}`);
    },
    updateElementSize: function updateElementSize(container, el) {
        let change = false;

        const currentWidth = el.getAttribute('width');
        const newWidth = container.getWidth().toString();
        if (currentWidth !== newWidth) {
            el.setAttribute('width', newWidth);
            change = true;
        }

        const currentHeight = el.getAttribute('height');
        const newHeight = container.getHeight().toString();
        if (currentHeight !== newHeight) {
            el.setAttribute('height', newHeight);
            change = true;
        }

        // Emit event only if there was any change
        if (change) {
            el.emit('size-update', {
                width: newWidth,
                height: newHeight,
            });
        }
    }

}