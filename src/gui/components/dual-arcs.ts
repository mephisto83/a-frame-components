import { AFRAME } from "../../painter/root";

export default function () {
    const THREE: any = (window as any).THREE;
    AFRAME.registerComponent('dual-arcs', {
        schema: {
            radius: { type: 'number', default: 1 },
            tube: { type: 'number', default: 1 },
            angleStart1: { type: 'number', default: 0 },
            angleLength1: { type: 'number', default: Math.PI }, // First arc covers half the circle
            angleStart2: { type: 'number', default: Math.PI },
            angleLength2: { type: 'number', default: Math.PI }, // Second arc covers the remaining half
            color1: { type: 'color', default: '#FFA500' }, // Orange
            color2: { type: 'color', default: '#808080' } // Grey
        },

        init: function () {
            const data = this.data;
            // Create first arc
            var geometry1 = new THREE.CircleGeometry(data.radius, 64, data.angleStart1, data.angleLength1);
            geometry1 = new THREE.EdgesGeometry(geometry1); // Convert to an edge geometry to get the arc
            var arc1 = new THREE.LineSegments(geometry1, new THREE.LineBasicMaterial({ color: data.color1 }));

            // Create second arc
            var geometry2 = new THREE.CircleGeometry(data.radius, 64, data.angleStart2, data.angleLength2);
            geometry2 = new THREE.EdgesGeometry(geometry2); // Convert to an edge geometry to get the arc
            var arc2 = new THREE.LineSegments(geometry2, new THREE.LineBasicMaterial({ color: data.color2 }));

            // Combine arcs into one object
            var group = new THREE.Group();
            group.add(arc1);
            group.add(arc2);

            // Add the combined object to the entity
            this.el.setObject3D('dual-arcs', group);
        }
    });
    AFRAME.registerPrimitive('a-dual-arcs', {
        defaultComponents: {
            'gui-interactable': {},
            'gui-item': { type: 'slider' },
            'dual-arcs': {}
        },
        mappings: {
            'radius': 'dual-arcs.radius',
            'tube': 'dual-arcs.tube',
            'angle-start-1': 'dual-arcs.angleStart1',
            'angle-length-1': 'dual-arcs.angleLength1',
            'angle-start-2': 'dual-arcs.angleStart2',
            'angle-length-2': 'dual-arcs.angleLength2',
            'color1': 'dual-arcs.color1',
            'color2': 'dual-arcs.color2',
        }
    });
}