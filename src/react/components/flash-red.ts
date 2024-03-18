import { AFRAME } from "../../react/root";
import { GetColor } from "../systems/ui";
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('flashing', {
        schema: {
            onColor: { default: 'red' },
            offColor: { default: '#FFF' }, // Default to white when not flashing
            duration: { default: 1000 } // Duration of one flash cycle in milliseconds
        },
        init: function () {
            this.el.setAttribute('material', 'color', this?.data?.offColor || '#FFF');
            this.flash = this.flash.bind(this);
        },
        play: function () {
            this.flash();
        },
        pause: function () {
            this.el.removeAttribute('animation__color');
        },
        flash: function () {
            const el = this.el;
            const data = { duration: 1000, onColor: '#fff000', offColor: '#000' };

            // Animate to red
            el.setAttribute('animation__color', `property: material.color; to: ${data?.onColor || 'red'}; dur: ${data.duration / 2}; loop: false;`);

            // Wait for half duration, then animate back to original color
            setTimeout(() => {
                el.setAttribute('animation__color', `property: material.color; to: ${data?.offColor || '#FFF'}; dur: ${data.duration / 2}; loop: false;`);
            }, data.duration / 2);

            // Keep flashing
            setTimeout(this.flash, data.duration);
        }
    });
}