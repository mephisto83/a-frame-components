import { AFRAME } from "../../react/root";

export default function () {
  const THREE: any = (window as any).THREE;
  AFRAME.registerComponent('rounded', {
    schema: {
      enabled: { default: true },
      width: { type: 'number', default: 1 },
      height: { type: 'number', default: 1 },
      radius: { type: 'number', default: 0.3 },
      topLeftRadius: { type: 'number', default: -1 },
      topRightRadius: { type: 'number', default: -1 },
      bottomLeftRadius: { type: 'number', default: -1 },
      bottomRightRadius: { type: 'number', default: -1 },
      depthWrite: { default: true },
      polygonOffset: { default: false },
      polygonOffsetFactor: { type: 'number', default: 0 },
      color: { type: 'color', default: "#F0F0F0" },
      opacity: { type: 'number', default: 1 },
      // Add targetColor for animation
      targetColor: { type: 'color', default: "#F0F0F0" },
      // Animation duration in milliseconds
      colorAnimationDuration: { type: 'number', default: 1000 },
    },
    // init: function () {
    //   this.rounded = new THREE.Mesh(this.draw(), new THREE.MeshStandardMaterial({ color: new THREE.Color(this.data.color) }));
    //   this.updateOpacity();
    //   this.el.setObject3D('mesh', this.rounded);
    // },
    init: function () {
      this.geometry = new THREE.ShapeGeometry(this.drawShape());
      this.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.data.color) });
      this.rounded = new THREE.Mesh(this.geometry, this.material);
      this.updateOpacity();
      this.el.setObject3D('mesh', this.rounded);
      this.startTime = 0; // Initialize startTime
      this.isColorAnimating = false; // Flag to track if animation is ongoing
    },
    drawShape: function () {
      const shape = new THREE.Shape();
      // ... (your roundedRect function here)

      const x = -this.data.width / 2, y = -this.data.height / 2;
      const corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
      if (this.data.topLeftRadius !== -1) { corners[0] = this.data.topLeftRadius; }
      if (this.data.topRightRadius !== -1) { corners[1] = this.data.topRightRadius; }
      if (this.data.bottomLeftRadius !== -1) { corners[2] = this.data.bottomLeftRadius; }
      if (this.data.bottomRightRadius !== -1) { corners[3] = this.data.bottomRightRadius; }

      roundedRect(shape, x, y, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3]);

      return shape;
    },
    update: function (oldData) {
      let updatedop = false;
      if (oldData.width !== undefined && oldData.height !== undefined) {
        if (this.data.width !== oldData.width || this.data.height !== oldData.height) {
          this.geometry = new THREE.ShapeGeometry(this.drawShape());
          this.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.data.color) });
          this.rounded = new THREE.Mesh(this.geometry, this.material);
          updatedop = true;
        }
      }
      if (this.data.enabled) {
        if (this.rounded) {
          this.rounded.visible = true;
          this.rounded.geometry = this.draw();
          updatedop = true;
          // this.rounded.material.color = new THREE.Color(this.data.color);

        }
      } else {
        this.rounded.visible = false;
      }
      if (updatedop) {
        this.updateOpacity();
      }
      // Check if color needs to be animated
      if (oldData.color !== this.data.color) {
        this.data.targetColor = this.data.color; // Set the target color
        this.startColorAnimation(); // Initiate the color animation
      }
    },
    updateOpacity: function () {
      if (this.data.opacity < 0) { this.data.opacity = 0; }
      if (this.data.opacity > 1) { this.data.opacity = 1; }
      if (this.data.opacity < 1) {
        this.rounded.material.transparent = true;
        this.rounded.material.opacity = this.data.opacity;
        this.rounded.material.alphaTest = 0;
      } else {
        this.rounded.material.transparent = false;
      }
    },
    tick: function (time, timeDelta) {
      // Animation logic
      if (this.isColorAnimating) {
        const elapsedTime = time - this.startTime;
        const fraction = elapsedTime / this.data.colorAnimationDuration;

        if (fraction < 1) {
          // Calculate the current color
          const currentColor = new THREE.Color().lerpColors(
            new THREE.Color(this.material.color.getHex()),
            new THREE.Color(this.data.targetColor),
            fraction
          );

          this.material.color = currentColor;
        } else {
          // End of animation
          this.material.color.set(this.data.targetColor);
          this.isColorAnimating = false;
        }
      }

    },
    startColorAnimation: function () {
      this.startTime = this.el.sceneEl.clock.elapsedTime * 1000; // A-Frame's clock time in ms
      this.isColorAnimating = true;
    },
    remove: function () {
      if (!this.rounded) { return; }
      this.el.object3D.remove(this.rounded);
      this.rounded = null;
    },
    draw: function () {
      const shape = new THREE.Shape();

      const x = -this.data.width / 2;
      const y = -this.data.height / 2;
      const width = this.data.width;
      const height = this.data.height;
      const radius = this.data.radius;

      const topLeftRadius = this.data.topLeftRadius !== -1 ? this.data.topLeftRadius : radius;
      const topRightRadius = this.data.topRightRadius !== -1 ? this.data.topRightRadius : radius;
      const bottomLeftRadius = this.data.bottomLeftRadius !== -1 ? this.data.bottomLeftRadius : radius;
      const bottomRightRadius = this.data.bottomRightRadius !== -1 ? this.data.bottomRightRadius : radius;

      shape.moveTo(x + topLeftRadius, y);
      shape.lineTo(x + width - topRightRadius, y);
      shape.quadraticCurveTo(x + width, y, x + width, y + topRightRadius);
      shape.lineTo(x + width, y + height - bottomRightRadius);
      shape.quadraticCurveTo(x + width, y + height, x + width - bottomRightRadius, y + height);
      shape.lineTo(x + bottomLeftRadius, y + height);
      shape.quadraticCurveTo(x, y + height, x, y + height - bottomLeftRadius);
      shape.lineTo(x, y + topLeftRadius);
      shape.quadraticCurveTo(x, y, x + topLeftRadius, y);

      return new THREE.ShapeGeometry(shape);
    },
    pause: function () { },
    play: function () { }
  });
  function roundedRect(ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
    if (!topLeftRadius) { topLeftRadius = 0.00001; }
    if (!topRightRadius) { topRightRadius = 0.00001; }
    if (!bottomLeftRadius) { bottomLeftRadius = 0.00001; }
    if (!bottomRightRadius) { bottomRightRadius = 0.00001; }
    ctx.moveTo(x, y + topLeftRadius);
    ctx.lineTo(x, y + height - topLeftRadius);
    ctx.quadraticCurveTo(x, y + height, x + topLeftRadius, y + height);
    ctx.lineTo(x + width - topRightRadius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - topRightRadius);
    ctx.lineTo(x + width, y + bottomRightRadius);
    ctx.quadraticCurveTo(x + width, y, x + width - bottomRightRadius, y);
    ctx.lineTo(x + bottomLeftRadius, y);
    ctx.quadraticCurveTo(x, y, x, y + bottomLeftRadius);
  }
  AFRAME.registerPrimitive('a-rounded', {
    defaultComponents: {
      rounded: {}
    },
    mappings: {
      enabled: 'rounded.enabled',
      width: 'rounded.width',
      height: 'rounded.height',
      radius: 'rounded.radius',
      'depth-write': 'rounded.depthWrite',
      'polygon-offset': 'rounded.polygonOffset',
      'polygon-offset-factor': 'rounded.polygonOffsetFactor',
      'top-left-radius': 'rounded.topLeftRadius',
      'top-right-radius': 'rounded.topRightRadius',
      'bottom-left-radius': 'rounded.bottomLeftRadius',
      'bottom-right-radius': 'rounded.bottomRightRadius',
      color: 'rounded.color',
      opacity: 'rounded.opacity'
    }
  });
}