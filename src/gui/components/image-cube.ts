import { AFRAME } from "../../react/root";
const THREE: any = (window as any).THREE;

export default function () {
    AFRAME.registerComponent('image-cube', {
        schema: {
            src: { type: 'asset' },  // The image source
            size: { type: 'number', default: 1 }  // Size of the cube
        },

        init: function () {
            var data = this.data;  // Component data

            // Create geometry for the cube
            var geometry = new THREE.BoxGeometry(data.size, data.size, data.size);

            // Create material with the image texture for each side
            var materialArray = [];
            for (var i = 0; i < 6; i++) {
                materialArray.push(new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(data.src)
                }));
            }

            // Create the mesh and add it to the entity
            var cube = new THREE.Mesh(geometry, materialArray);
            this.el.setObject3D('mesh', cube);
        }
    });
    AFRAME.registerPrimitive('a-image-cube', {
        defaultComponents: {
            'image-cube': {}
        },
        mappings: {
            src: 'image-cube.src',
            size: 'image-cube.size',
        }
    })
}