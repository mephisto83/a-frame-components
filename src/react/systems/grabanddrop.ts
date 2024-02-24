/* globals AFRAME */
import ghost_component from "../../gui/components/ghost";
import { PAINTER_CONSTANTS } from "../constants";
import { AFRAME } from "../root";
import { hexToHsv, hsb2rgb, raiseCustomEvent, setConsoleText, uvToColorHex } from "../util";
const THREE: any = (window as any).THREE;
export const GrabAndDropEvents = {
    GRAB_START: "grab-start",
    GRABBING_START: 'grabbing-starting',
    GRAB_RELEASE: 'grab-release',
    GRABBING_ENDED: 'grabbing-ended',
    DROPPED_GRABBED_DATA: 'drop-grabbed-data',
    GRAB_OVER: 'grab-over',
    GRAB_OUT: 'grab-out',
    GRAB_TARGET_CHANGE: 'grab-target-change'
}

export default function () {
    ghost_component()
    AFRAME.registerSystem('grabanddrop', {
        init: function () {
            this.ghostReferences = {};
            this.inputDeviceState = {};
            this.inputDevices = {};
            this.ghostTargets = {};
            this.closetsTargets = {}
            this.scene = this.sceneEl;
            customEventListener(GrabAndDropEvents.GRAB_START, this.onGrabStart.bind(this))
            customEventListener(GrabAndDropEvents.GRAB_RELEASE, this.onGrabRelease.bind(this))
            customEventListener(GrabAndDropEvents.GRAB_OVER, this.onGrabOver.bind(this));
            customEventListener(GrabAndDropEvents.GRAB_OUT, this.onGrabOut.bind(this));
            this.scene.addEventListener('mouseup', (event) => {
                let inputDevice = setInputDevice(event)
                if (inputDevice) {
                    let details: GrabReleaseDetails = {
                        inputDeviceId: inputDevice.id
                    };
                    raiseCustomEvent(GrabAndDropEvents.GRAB_RELEASE, details)
                }
            });
        },
        onGrabOut: function (evt: GrabOutDetails) {
            const { deviceId, component } = evt;
            let ghostTargets: GhostTargets = this.ghostTargets;
            let ghostReferences: GhostReferences = this.ghostReferences;
            if (ghostReferences[deviceId]) {
                let ghostReference = ghostReferences[deviceId];
                if (ghostTargets[deviceId] && ghostTargets[deviceId].includes(component)) {
                    ghostTargets[deviceId] = ghostTargets[deviceId].filter(x => x !== component);
                    let closest = this.getClosest(deviceId)
                    if (component !== closest) {
                        ghostReference.emit(GrabAndDropEvents.GRAB_TARGET_CHANGE, {
                            component: closest,
                            deviceId
                        });
                    }
                }
            }
        },
        onGrabOver: function (evt: GrabOverDetails) {
            const { deviceId, component } = evt;
            let ghostTargets: GhostTargets = this.ghostTargets;
            let ghostReferences: GhostReferences = this.ghostReferences;
            if (ghostReferences[deviceId]) {
                let ghostReference = ghostReferences[deviceId];
                ghostTargets[deviceId] = ghostTargets[deviceId] || [];
                if (ghostTargets[deviceId] && !ghostTargets[deviceId].includes(component)) {
                    ghostTargets[deviceId].push(component);
                    let closest = this.getClosest(deviceId)

                    if (component === closest) {
                        ghostReference.emit(GrabAndDropEvents.GRAB_TARGET_CHANGE, { component, deviceId })
                    }
                }
            }
        },
        onGrabRelease: function (evt: GrabReleaseDetails) {
            const { inputDeviceId } = evt;

            let closestItem: GhostTarget | null = this.getClosest(inputDeviceId);
            if (closestItem?.el) {
                let details: GrabDetails = this.inputDeviceState[inputDeviceId];
                let { inputDevice, data, category } = details;
                closestItem.el.emit(GrabAndDropEvents.DROPPED_GRABBED_DATA, { inputDevice, data, category });
            }
            this.clearInputDeviceData(inputDeviceId)
            this.killGhost(inputDeviceId);
            raiseCustomEvent(GrabAndDropEvents.GRABBING_ENDED, { deviceId: inputDeviceId });
        },
        clearInputDeviceData: function (inputDeviceId) {
            let inputDevices: InputDevices = this.inputDeviceState;
            let ghostTargets: GhostTargets = this.ghostTargets;
            if (inputDevices[inputDeviceId]) {
                delete inputDevices[inputDeviceId]
                ghostTargets[inputDeviceId] = []
            }
        },
        getClosest: function (inputDeviceId: string | number): GhostTarget | null {
            let ghostTargets: GhostTargets = this.ghostTargets;
            let inputDevices: { [str: string]: InputDeviceState } = this.inputDeviceState;
            if (inputDevices[inputDeviceId]?.inputDevice) {
                if (ghostTargets[inputDeviceId]?.length) {
                    let ray = inputDevices[inputDeviceId].inputDevice.getRay();
                    let position = getRayposition(ray);
                    let sorted = ghostTargets[inputDeviceId].sort((a, b) => {
                        return distanceBetweenPointsFast(position, a.position) - distanceBetweenPointsFast(position, b.position);
                    });
                    return sorted[0];
                }
            }
            return null;
        },
        killGhost: function (inputDeviceId: string | number) {
            let ghostReferences: GhostReferences = this.ghostReferences;
            if (ghostReferences[inputDeviceId]) {
                ghostReferences[inputDeviceId].setAttribute(GhostAttributes.Die, true);
                delete ghostReferences[inputDeviceId]
            }
        },
        createGhost: function (ghostContent: Ghost) {
            if (!ghostContent) {
                throw 'no ghost';
            };
            const ghost = document.createElement('a-ghost');
            ghost.appendChild(ghostContent);

            return ghost;
        },
        onGrabStart: function (evt: GrabStartDetails) {
            this.setInputDeviceState(evt);
            const { component, inputDevice, ghost, category } = evt;
            if (inputDevice?.id) {
                console.log(`grab start ${inputDevice.id}`)
                let ghostReferences: GhostReferences = this.ghostReferences;
                this.killGhost(inputDevice.id);
                var worldPosition = new THREE.Vector3();
                component.el.object3D.getWorldPosition(worldPosition);

                let newGhost = this.createGhost(ghost);
                ghostReferences[inputDevice.id] = newGhost;
                newGhost.setAttribute(GhostAttributes.Device, inputDevice.id);
                newGhost.setAttribute(GhostAttributes.Position, toPosition(worldPosition))
                newGhost.setAttribute(GhostAttributes.Alive, true);
                this.scene.appendChild(newGhost);
                raiseCustomEvent(GrabAndDropEvents.GRABBING_START, { category, deviceId: inputDevice.id });
            }
        },
        setInputDeviceState(evt: GrabDetails) {
            const { inputDevice, data, category, ghost, cursorEl } = evt;
            this.inputDeviceState = {
                ...this.inputDeviceState,
                [inputDevice.id]: {
                    inputDevice,
                    data,
                    ghost,
                    cursorEl,
                    category
                }
            }
        }
    });
}
function distanceBetweenPointsFast(pointA: Vector, pointB: Vector): number {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;

    return (dx * dx + dy * dy + dz * dz);
}
function distanceBetweenPoints(pointA: Vector, pointB: Vector): number {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function lerp3(v1: Vector, v2: Vector, t: number): Vector {
    return {
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t,
        z: v1.z + (v2.z - v1.z) * t
    };
}
export function lerp(x1: number, x2: number, t: number): number {
    return x1 + (x2 - x1) * t;
}

export function calculateEndPoint(origin: Vector, direction: Vector, distance: number): Vector {
    // Scale the direction vector by the distance
    const scaledDirection = {
        x: direction.x * distance,
        y: direction.y * distance,
        z: direction.z * distance
    };

    // Add the scaled direction to the origin to get the end point
    return {
        x: origin.x + scaledDirection.x,
        y: origin.y + scaledDirection.y,
        z: origin.z + scaledDirection.z
    };
}

export interface GhostReferences { [id: string | number]: Ghost }
export interface InputDevices {
    [id: string | number]: InputDevice
}
export interface GhostTargets {
    [id: string | number]: GhostTarget[]
}
export interface GhostTarget {
    id: string | number;
    el?: any;
    position: Vector
}
export interface Vector {
    x: number;
    y: number;
    z: number;
}
export enum GhostAttributes {
    Die = 'die',
    Device = 'device',
    Alive = 'alive',
    Position = 'position'
}
export interface InputDeviceState {
    inputDevice: InputDevice,
    data: any,
    ghost: Ghost,
    cursorEl: any,
    category: string
}
export interface InputDevice {
    id: string | number;
    getPosition: () => Vector;
    getRay: () => any;
    emit: (evtName: string, details: any) => void
};
export interface Ghost extends Node {
    setAttribute: (ghostAttribute: GhostAttributes, value: any) => void
    emit: (evtName: string, details: { deviceId: string | number, component: GhostTarget }) => void
};

export interface GrabStartDetails extends GrabDetails {
    component: any
}
export interface GrabReleaseDetails {
    inputDeviceId: string | number
}

export interface GrabOutDetails extends GrabOverDetails { }

export interface GrabOverDetails {
    deviceId: string | number;
    component: GhostTarget;
}
export interface GrabDetails {
    inputDevice: InputDevice,
    data: any;
    cursorEl?: any;
    category: string;
    ghost?: Ghost
}
// The hook can optionally accept a callback to be executed when the event is triggered
export const customEventListener = <T extends any>(eventName: string, callback: (detail: T, evt?: any) => void) => {

    // Event handler to call the provided callback
    const handler = async (event: CustomEvent<T>) => {
        await callback(event.detail, event);
    };

    // Add event listener
    window.addEventListener(eventName, handler as EventListener);

    // Clean up
    return () => {
        window.removeEventListener(eventName, handler as EventListener);
    };

};

const inputDeviceContext: { [id: string | number]: InputDevice } = {}
export function setInputDevice(evnt: any): InputDevice {
    let cursor = (evnt?.detail?.cursorEl || evnt?.detail?.el);
    if (cursor?.$id) {
        if (!inputDeviceContext[cursor?.$id]) {
            let device: InputDevice = {
                id: cursor?.$id,
                emit: (evtName: string, details: any) => {
                    raiseCustomEvent(evtName, details);
                },
                getPosition: () => {
                    return evnt.detail.cursorEl.object3D.position
                },
                getRay: () => {
                    return cursor?.components.raycaster.raycaster;
                }
            };
            inputDeviceContext[cursor?.$id] = device;
        }
        return inputDeviceContext[cursor?.$id];
    }
    return null;
}
export function getRayposition(ray: any) {
    if (ray?.ray) {
        let { origin, direction } = ray.ray;
        return origin;
    }
    return null;
}
export function getInputDevice(id: any): InputDevice {
    if (id) {
        return inputDeviceContext[id];
    }

}

function toPosition(worldPosition: any): any {
    return `${worldPosition.x} ${worldPosition.y} ${worldPosition.z}`;
}
