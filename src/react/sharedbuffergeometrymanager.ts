import SharedBufferGeometry from "./sharedbuffergeometry";


export default class SharedBufferGeometryManager {
    private static sharedBuffers: { [name: string]: any } = {};

    constructor() {
    }

    static addSharedBuffer(name: string, material: any): void {
        const bufferGeometry = new SharedBufferGeometry(material);
        this.sharedBuffers[name] = bufferGeometry;
    }

    static getSharedBuffer(name: string): any | undefined {
        return this.sharedBuffers[name];
    }
}