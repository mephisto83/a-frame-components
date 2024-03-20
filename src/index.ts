import painter from "./react";
import useEventListenerOn from "./react/useEventListenerOn";
import { raiseOn, setAttribute, useEventsListenerOn, useBindEventOn } from './react/useEventListenerOn';
import { createElement } from "./util";
export { raiseOn, setAttribute, useEventsListenerOn, useBindEventOn, useEventListenerOn, createElement };
export async function load() {
    return painter();
}
