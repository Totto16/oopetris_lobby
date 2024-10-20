import fs from 'fs';
import path from 'path';

const rootDir = path.join(__dirname, '..', '..');
const nodeNativePackage = require('node-gyp-build')(rootDir);

type NativePointer = number;

export class Server {
    private __server_native: NativePointer;

    private constructor(server_native: NativePointer) {
        this.__server_native = server_native;
    }

    static async start(port: number, playerCount: number): Promise<Server> {
        const server_native = await nodeNativePackage.start(port, playerCount);
        return new Server(server_native);
    }

    async stop(): Promise<void> {
        nodeNativePackage.stop(this.__server_native);
    }
}
