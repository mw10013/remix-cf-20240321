import { Buffer } from "node:buffer";

export function setUpGlobals() {
    globalThis.Buffer = Buffer;
}