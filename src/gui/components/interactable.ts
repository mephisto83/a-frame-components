import { AFRAME } from "../../painter/root";

export default function () {
    AFRAME.registerComponent('gui-interactable', {
        schema: {
            clickAction: { type: 'string' },
            hoverAction: { type: 'string' },
            keyCode: { type: 'number', default: -1 },
            key: { type: 'string' },
        },
        init: function () {
            var _this = this;
            var data = this.data;
            var el = this.el;

            if (data.keyCode > 0) {
                window.addEventListener("keydown", function (event) {
                    // console.log('in keydown handler, event key: ' + event.key);
                    let prevent = false;
                    if (event.key == data.key) {
                        //    console.log("key press by gui-interactable, key: " + data.key);
                        el.emit('click');
                        prevent = true;
                    } else if (event.keyCode == data.keyCode) {
                        //    console.log("key press by gui-interactable, keyCode: " + data.keyCode);
                        el.emit('click');

                        prevent = true;
                    }
                    if (prevent)
                        event.preventDefault();
                }, true);
            }
        },
        update: function () {
        },
        tick: function () {
        },
        remove: function () {
        },
        pause: function () {
        },
        play: function () {
        },
        setClickAction: function (action) {
            this.data.clickAction = action; //change function dynamically
        },
    });
}