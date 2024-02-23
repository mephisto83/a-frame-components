/* globals AFRAME */
import { PAINTER_CONSTANTS } from "../constants";
import { AFRAME } from "../root";
import { hexToHsv, hsb2rgb, raiseCustomEvent, setConsoleText, uvToColorHex } from "../util";
import grabanddrop from "./grabanddrop";
const THREE: any = (window as any).THREE;
export const INTERACTABLES = {
  PAINTUI: 'paint-ui',
  PAINT_CANVAS: 'paint-canvas',
  PAINT_CANVAS_LAYER: 'paint-canvas-layer'
}
export const DrawMode = {
  Draw: 'Draw',
  Erase: 'Erase',
  Transform: 'Transform'
}
export const UIStates = {
  CurrentColor: 'currentcolor',
  CurrentSize: 'currentsize',
  ColorHistory: 'colorhistory',
  Brightness: 'brightnessColor',
  DrawMode: 'drawmode'
}
export const COLOR_SCHEME = {
  DEFAULT: '1c1c1c-ffd166-30bced-0daf97-FF1F4D'.split('-').map(t => `#${t}`)
}
export function GetColor(index: number) {
  return COLOR_SCHEME.DEFAULT[index % COLOR_SCHEME.DEFAULT.length]
}
export function GetPositiveColor() {
  return GetColor(3);
}
export function GetNegativeColor() {
  return GetColor(4);
}
export function GetBackgroundColor() {
  return '#000'
}
const context = { ui: null }
export function setUISystems(ui: any) {
  context.ui = ui;
}
export function getUISystem() {
  return context.ui;
}
function addUnique<T>(array: T[], value: T): T[] {
  // Remove any existing occurrences of the value
  const filteredArray = array.filter(item => item !== value);

  // Add the value to the end of the array
  filteredArray.push(value);

  // Return the new array
  return filteredArray;
}

export default function () {
  AFRAME.registerSystem('ui', {
    init: function () {
      // this.initTextures();
      this.liveInteractions = {}
      this.liveInteractingKeys = [];
      this.buttonsState = {};
      this.buttonsStateDetail = {};
      this.states = {};
      this.states[UIStates.CurrentSize] = .1;
      this.states[UIStates.CurrentColor] = '#ffffff';
      this.states[UIStates.ColorHistory] = ['#FFFFFF']
      this.states[UIStates.Brightness] = 1;
      this.states[UIStates.DrawMode] = DrawMode.Draw;
      this.raycasters = {};
      setUISystems(this);
    },
    getColorHistory: function () {
      return this.states[UIStates.ColorHistory]
    },
    setState: function (key, value) {
      switch (key) {
        case UIStates.CurrentColor:
          this.states[UIStates.ColorHistory] = this.states[UIStates.ColorHistory] || [];
          if (this.states[UIStates.ColorHistory].indexOf(value) === -1) {
            this.states[UIStates.ColorHistory] = addUnique(this.states[UIStates.ColorHistory], value);
            if (this.states[UIStates.ColorHistory].length > 6) {
              this.states[UIStates.ColorHistory].shift();
            }
            let colorList = document.querySelector('#color-list');
            if (colorList) {
              colorList.setAttribute('color-array', this.states[UIStates.ColorHistory].join());
            }
          }
          if (this.states[key] !== value) {
            raiseCustomEvent(PAINTER_CONSTANTS.COLOR_CHANGE, { value })
          }
          this.states[key] = value;
          break
        case UIStates.Brightness:
          this.states[key] = value;
          break;
        default:
          this.states[key] = value;
          break;
      }
    },
    getDrawingMode: function () {
      return this.getState(UIStates.DrawMode);
    },
    setDrawMode: function () {
      return getUISystem().setDrawingMode(DrawMode.Draw);
    },
    setDrawingMode: function (mode) {
      let result = this.setState(UIStates.DrawMode, mode);
      raiseCustomEvent(PAINTER_CONSTANTS.DRAWING_MODE_CHANGED, { mode })
      return result;
    },
    setEraseMode: function () {
      return getUISystem().setDrawingMode(DrawMode.Erase);
    },
    setCurrentColorState: function (color) {
      return this.setState(UIStates.CurrentColor, color);
    },
    setCursorSize: function (size) {
      return this.setState(UIStates.CurrentSize, size);
    },
    getCursorSize: function () {
      return this.getState(UIStates.CurrentSize);
    },
    getCurrentColorState: function () {
      return this.getState(UIStates.CurrentColor);
    },
    setCurrentBrightnessState: function (color) {
      return this.setState(UIStates.Brightness, color);
    },
    getCurrentBrightnessState: function () {
      return this.getState(UIStates.Brightness);
    },
    getState: function (key) {
      return this.states[key]
    },
    getRaycasterByCaster: function (casterId) {
      for (let key in this.raycasters) {
        if (this.raycasters[key]?.raycaster?.$id === casterId) {
          return this.raycasters[key];
        }
      }
    },
    setRaycaster: function (caster) {
      if (caster?.el?.id) {
        this.raycasters[caster?.el?.id] = caster;
      }
    },
    setButtonState: function (hand, button, value) {
      this.buttonsState[hand] = this.buttonsState[hand] || {};
      this.buttonsState[hand][button] = value;
      this.printStates()
    },
    setButtonStateDetail: function (hand, button, value) {
      this.buttonsStateDetail[hand] = this.buttonsStateDetail[hand] || {};
      this.buttonsStateDetail[hand][button] = value;
      this.printStates()
    },
    printStates: function () {
      let message = '';
      for (let i in this.buttonsState) {
        for (let b in this.buttonsState[i]) {
          message += `Hand: ${i} Button: ${b} Value: ${this.buttonsState[i][b]}\n`;
        }
      }
      for (let i in this.states) {
        message += `State: ${i} Value: ${JSON.stringify(this.states[i])}\n`;
      }
      setConsoleText(message, '.button-states-console')
    },
    getButtonState: function (hand, button) {
      if (this.buttonsState && this.buttonsState[hand])
        return this.buttonsState[hand][button]
      return undefined;
    },
    getButtonStateDetail: function (hand, button) {
      if (this.buttonsStateDetail && this.buttonsStateDetail[hand])
        return this.buttonsStateDetail[hand][button]
      return undefined;
    },
    setLiveInteraction: function (key, value) {
      this.liveInteractions[key] = value;
      this.liveInteractingKeys = Object.keys(this.liveInteractingKeys).filter(d => this.liveInteractingKeys[d]);
    },
    isInteracting: function (key) {
      return this.liveInteractingKeys[key];
    },
    onlyInteracting: function (key) {
      if (this.liveInteractingKeys.length > 1) { return false }
      return this.liveInteractingKeys[0] === key;
    },

    // initTextures: function () {
    //   var self = this;
    //   var hoverTextureUrl = 'assets/images/ui-hover.png';
    //   var pressedTextureUrl = 'assets/images/ui-pressed.png';
    //   this.sceneEl.systems.material.loadTexture(hoverTextureUrl, { src: hoverTextureUrl }, onLoadedHoverTexture);
    //   this.sceneEl.systems.material.loadTexture(pressedTextureUrl, { src: pressedTextureUrl }, onLoadedPressedTexture);
    //   function onLoadedHoverTexture(texture) {
    //     self.hoverTexture = texture;
    //   }
    //   function onLoadedPressedTexture(texture) {
    //     self.pressedTexture = texture;
    //   }
    // },

    closeAll: function () {
      var els: any = document.querySelectorAll('[ui]');
      var i;
      for (i = 0; i < els.length; i++) {
        els[i].components.ui.close();
      }
    }
  });
  grabanddrop();
}
