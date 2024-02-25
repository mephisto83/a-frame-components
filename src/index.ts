import painter from "./react";
import ui from "./react/systems/ui";
import useEventListenerOn from "./react/useEventListenerOn";
import { useBindEventOn } from './react/useEventListenerOn';

export { useBindEventOn, useEventListenerOn };
export async function load() {
    ui();
    return painter();
}
