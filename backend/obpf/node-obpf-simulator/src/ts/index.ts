import path from 'path';

const rootDir = path.join(__dirname, '..', '..');
const nodeNativePackage = require('node-gyp-build')(rootDir);

type NativePointer = number;

export type LoggerLevel =
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'err'
    | 'critical'
    | 'off';

export type LoggerCallback = (
    level: LoggerLevel | undefined,
    message: string,
    time: Date,
) => void;

export class Server {
    private __server_native: NativePointer;

    private constructor(server_native: NativePointer) {
        this.__server_native = server_native;
    }

    static async start(port: number, playerCount: number): Promise<Server> {
        const server_native = await nodeNativePackage.start(port, playerCount);
        return new Server(server_native);
    }

    register_logger(callback: LoggerCallback): void {
        nodeNativePackage.register_logger(callback);
    }

    async stop(): Promise<void> {
        nodeNativePackage.stop(this.__server_native);
    }
}
