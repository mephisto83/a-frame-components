import { AFRAME } from "../../react/root";
import { IK, } from './three-ik';
import { Vector3 } from 'three';

export default function () {
    const THREE: any = (window as any).THREE;
    AFRAME.registerComponent('skeleton-body', {
        schema: {
        },
        tick: function () {
            if (this.pivot) {
                this.pivot.setAttribute('rotation', `0 ${this.pivotRotaion} 0`)
                this.pivotRotaion += .05;
                this.ik.solve();
                this.updateBones();
            }
        },
        updateBones: function () {
            let me = this;
            me.renderBones = me.renderBones || {}
            this.ik.chains.map((chain: any) => {
                let joints = chain.joints;
                let origin = chain.origin;
                joints.map(joint => {
                    let bone = joint.bone;
                    let id = bone.uuid;
                    let distance = joint.distance;
                    let direction = joint._direction;
                    let position = joint._worldPosition;
                    let endPosition = calculateEndPosition(position, direction, distance);
                    endPosition = subtract(endPosition, origin)
                    position = subtract(position, origin)

                    me.renderBones[id] = {
                        ...(me.renderBones[id] || {}),
                        startPosition: position,
                        endPosition
                    }
                    if (!me.renderBones[id].entity) {
                        let entity = document.createElement('a-entity');
                        me.renderBones[id].entity = entity;
                        me.el.appendChild(entity);
                    }
                    let entity = me.renderBones[id].entity;
                    let start = `${me.renderBones[id].startPosition.x} ${me.renderBones[id].startPosition.y} ${me.renderBones[id].startPosition.z}`;
                    let end = `${me.renderBones[id].endPosition.x} ${me.renderBones[id].endPosition.y} ${me.renderBones[id].endPosition.z}`;
                    entity.setAttribute('line', `start: ${start}; end: ${end}; color: red`)
                })
            })
        },
        init: function () {
            let me = this;
            this.pivotRotaion = 0;
            let tem = Math.E;
            let el = this.el;
            const ik: any = new IK();
            this.ik = ik;
            const chain = new THREE.IKChain();
            const constraints = [new THREE.IKBallConstraint(90)];
            const bones = [];

            const loader = new THREE.GLTFLoader();
            let rig: any = document.createElement('a-entity');
            loader.load('assets/models/basic-inverse-kinematics-rig.glb', function (gltf) {
                console.log(gltf);
                rig.setObject3D('a-entity', gltf.scene);
                me.el.appendChild(rig);
            });

            // Create a target that the IK's effector will reach
            // for.
            const movingTarget = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            movingTarget.position.z = 2;
            const pivot = new THREE.Object3D();
            pivot.add(movingTarget);
            let pivotEntity: any = document.createElement('a-entity');
            pivotEntity.setObject3D('a-entity', pivot)
            this.pivot = pivotEntity;
            el.appendChild(pivotEntity);

            // Create a chain of Bone's, each wrapped as an IKJoint
            // and added to the IKChain
            for (let i = 0; i < 10; i++) {
                const bone = new THREE.Bone();
                bone.position.y = i === 0 ? 0 : 0.5;

                if (bones[i - 1]) { bones[i - 1].add(bone); }
                bones.push(bone);

                // The last IKJoint must be added with a `target` as an end effector.
                const target = i === 9 ? movingTarget : null;
                chain.add(new THREE.IKJoint(bone, { constraints }), { target });
            }

            // Add the chain to the IK system
            ik.add(chain);

            // Ensure the root bone is added somewhere in the scene
            let rootBone = ik.getRootBone();
            let rootBoneEntity: any = document.createElement('a-entity');
            rootBoneEntity.setObject3D('a-entity', rootBone)

            el.appendChild(rootBoneEntity);

            // Create a helper and add to the scene so we can visualize
            // the bones

            // Add the combined object to the entity
            // this.el.setObject3D('skeleton-body', helper);
        },
        buildHuman: function () {
            // Create a root bone
            const pelvis = new THREE.Bone();

            // Create IK chains and constraints
            const spineChain = new THREE.IKChain();
            const legChainL = new THREE.IKChain();
            const legChainR = new THREE.IKChain();

            // Constraints to limit joint rotations, 90 degrees here as an example
            const ballConstraint = new THREE.IKBallConstraint(90);

            // Adding bones to the chains with constraints
            // Spine chain example
            const spine = new THREE.Bone();
            spine.position.y = 10; // Adjust for a basic spine length
            spineChain.add(spine, [ballConstraint]);

            // Leg chains - Left leg example
            const upperLegL = new THREE.Bone();
            upperLegL.position.y = -10; // Positioning relative to pelvis
            upperLegL.position.x = -3; // Offset to the left side
            const lowerLegL = new THREE.Bone();
            lowerLegL.position.y = -10; // Positioning for the length of the leg
            legChainL.add(upperLegL, [ballConstraint]); // Add to chain with constraint
            legChainL.add(lowerLegL); // Adding lower leg without additional constraints for simplicity

            // Similar setup for right leg and arms...
        }
    });
    AFRAME.registerPrimitive('frame-skeleton-body', {
        defaultComponents: {
            'gui-interactable': {},
            'gui-item': {},
            'skeleton-body': {}
        },
        mappings: {
        }
    });

    function normalize(vector: Vector3): Vector3 {
        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        return magnitude === 0
            ? { x: 0, y: 0, z: 0 }
            : {
                x: vector.x / magnitude,
                y: vector.y / magnitude,
                z: vector.z / magnitude,
            };
    }

    function calculateEndPosition(startPosition: Vector3, direction: Vector3, distance: number): Vector3 {
        const normalizedDirection = normalize(direction);
        return {
            x: startPosition.x + normalizedDirection.x * distance,
            y: startPosition.y + normalizedDirection.y * distance,
            z: startPosition.z + normalizedDirection.z * distance,
        };
    }

    function subtract(pos, origin) {
        let vector = { ...pos };
        vector.x = vector.x - origin.x;
        vector.y = vector.y - origin.y;
        vector.z = vector.z - origin.z;
        return vector;
    }
}