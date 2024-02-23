import { AFRAME } from '../systems/brush';
import { uuidv4 } from '../util';
const THREE: any = (window as any).THREE;
export default function () {
    AFRAME.registerComponent('interactions', {
        schema: {
            value: { type: 'string' },
        },
        onButtonInteraction: function (evt, args) {
            console.log('button interaction');
            let arg = args.find(c => c.raycaster)
            this.system.setRaycaster(arg?.raycaster);
            console.log('evt :')
            console.log(`${evt?.detail}`);
            this.system.setButtonState(arg?.raycaster?.el?.id || args[0].hand, args[0].button, args[0].value);
            this.system.setButtonStateDetail(arg?.raycaster?.el?.id || args[0].hand, args[0].button, evt?.detail);
            console.log('button interaction complete');
        },
        onMouseInteraction: function (evt, args) {
            console.log('mouse interaction');
            console.log('evt :')
            console.log(`${evt?.detail}`);
        },
        init: function () {
            this.onButtonInteraction = this.onButtonInteraction.bind(this);
            this.onMouseInteraction = this.onMouseInteraction.bind(this);
            var system = this.el.sceneEl.systems.ui; // Access by system name
            this.system = system;
        }
    })
}