import { Utils } from "./util";

/* global THREE */
const THREE = (window as any).THREE;

export default async function () {

  const AtlasJSON = await Utils.loadJSON('assets/images/brush_atlas.json');

  function Atlas() {
    this.map = new THREE.TextureLoader().load('assets/images/' + AtlasJSON.meta.image);
  }

  Atlas.prototype = {
    getUVConverters: function (filename) {
      if (filename) {
        filename = filename.replace('brushes/', '');
        return {
          convertU: function (u) {
            var totalSize = AtlasJSON.meta.size;
            var data = AtlasJSON.frames[filename];
            if (u > 1 || u < 0) {
              u = 0;
            }
            return data.frame.x / totalSize.w + u * data.frame.w / totalSize.w;
          },

          convertV: function (v) {
            var totalSize = AtlasJSON.meta.size;
            var data = AtlasJSON.frames[filename];
            if (v > 1 || v < 0) {
              v = 0;
            }

            return 1 - (data.frame.y / totalSize.h + v * data.frame.h / totalSize.h);
          }
        };
      } else {
        return {
          convertU: function (u) { return u; },
          convertV: function (v) { return v; }
        };
      }
    }
  };

  (window as any).atlas = new Atlas();

};