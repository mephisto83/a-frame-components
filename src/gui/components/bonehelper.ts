import { Object3D, Matrix4, ConeGeometry, Vector3, Mesh, MeshBasicMaterial, AxesHelper, Color } from 'three';
const THREE: any = (window as any).THREE;

export class BoneHelper extends THREE.Object3D {
    boneMesh: Object3D | Mesh;
    axesHelper: AxesHelper;

    constructor(height: number, boneSize: number, axesSize: number) {
        super();

        if (height !== 0) {
            const geo = new ConeGeometry(boneSize, height, 4);
            geo.applyMatrix4(new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / 2));
            this.boneMesh = new Mesh(geo, new MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
                depthTest: false,
                depthWrite: false
            }));
        } else {
            this.boneMesh = new THREE.Object3D();
        }

        this.boneMesh.position.z = height / 2;
        (this as any).add(this.boneMesh);

        this.axesHelper = new AxesHelper(axesSize);
        (this as any).add(this.axesHelper);
    }
}

export class IKHelper extends THREE.Object3D {
    private ik: any; // Assuming `ik` is of a type not defined here
    private _meshes: Map<any, BoneHelper> = new Map();
    private _showBones: boolean;
    private _showAxes: boolean;
    private _wireframe: boolean;
    private _color: Color;

    constructor(ik: any, { color = new Color(0xff0077), showBones = true, boneSize = 0.1, showAxes = true, axesSize = 0.2, wireframe = true } = {}) {
        super();

        if (!ik.isIK) {
            throw new Error('IKHelper must receive an IK instance.');
        }

        this.ik = ik;
        this._showBones = showBones;
        this._showAxes = showAxes;
        this._wireframe = wireframe;
        this._color = color;

        ik.chains.forEach((rootChain: any) => {
            let chainsToMeshify = [rootChain];
            while (chainsToMeshify.length) {
                let chain = chainsToMeshify.shift();
                for (let i = 0; i < chain.joints.length; i++) {
                    let joint = chain.joints[i];
                    let nextJoint = chain.joints[i + 1];
                    let distance = nextJoint ? nextJoint.distance : 0;
                    if (chain.base === joint && chain !== rootChain) {
                        continue;
                    }
                    let mesh: any = new BoneHelper(distance, boneSize, axesSize);
                    mesh.matrixAutoUpdate = false;
                    this._meshes.set(joint, mesh);
                    (this as any).add(mesh);
                }
                [...chain.chains.values()].forEach((subChains: any) => {
                    subChains.forEach((subChain: any) => {
                        chainsToMeshify.push(subChain);
                    });
                });
            }
        });
    }

    get showBones(): boolean {
        return this._showBones;
    }

    set showBones(value: boolean) {
        if (this._showBones === value) return;
        this._meshes.forEach((mesh: any) => {
            if (value) {
                mesh.add(mesh.boneMesh);
            } else {
                mesh.remove(mesh.boneMesh);
            }
        });
        this._showBones = value;
    }

    get showAxes(): boolean {
        return this._showAxes;
    }

    set showAxes(value: boolean) {
        if (this._showAxes === value) return;
        this._meshes.forEach((mesh: any) => {
            if (value) {
                mesh.add(mesh.axesHelper);
            } else {
                mesh.remove(mesh.axesHelper);
            }
        });
        this._showAxes = value;
    }

    get wireframe(): boolean {
        return this._wireframe;
    }

    set wireframe(value: boolean) {
        if (this._wireframe === value) return;
        this._meshes.forEach((mesh) => {
            if (mesh.boneMesh instanceof Mesh) { // Extra type check for safety
                mesh.boneMesh.material.wireframe = value;
            }
        });
        this._wireframe = value;
    }

    get color(): Color {
        return this._color;
    }

    set color(value: Color) {
        if (this._color.equals(value)) return;
        this._meshes.forEach((mesh) => {
            if (mesh.boneMesh instanceof Mesh) { // Extra type check for safety
                mesh.boneMesh.material.color = value;
            }
        });
        this._color = value;
    }
}
