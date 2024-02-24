import painter from "./react";
import useEventListenerOn from "./react/useEventListenerOn";
import { useBindEventOn } from './react/useEventListenerOn';

export { useBindEventOn, useEventListenerOn };
export async function load() {
    return painter();
}
