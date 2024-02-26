import painter from "./react";
import useEventListenerOn from "./react/useEventListenerOn";
import { raiseOn, useBindEventOn } from './react/useEventListenerOn';

export { raiseOn, useBindEventOn, useEventListenerOn };
export async function load() {
    return painter();
}
