import painter from "./react";
import useEventListenerOn from "./react/useEventListenerOn";
import { raiseOn, setAttribute, updateAttribute, watchAttribute, useEventsListenerOn, findFrameElement, useBindEventOn } from './react/useEventListenerOn';
import { createElement, findClosestValue } from "./util";
import framemixin from './gui/components/mixin'
export {
    framemixin,
    raiseOn,
    findClosestValue,
    findFrameElement,
    updateAttribute,
    watchAttribute,
    setAttribute,
    useEventsListenerOn,
    useBindEventOn,
    useEventListenerOn,
    createElement
};

export async function load() {
    return painter();
}
