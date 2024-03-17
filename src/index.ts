import painter from "./react";
import useEventListenerOn from "./react/useEventListenerOn";
import { raiseOn, setAttribute, useBindEventOn } from './react/useEventListenerOn';

export { raiseOn, setAttribute, useBindEventOn, useEventListenerOn };
export async function load() {
    return painter();
}
