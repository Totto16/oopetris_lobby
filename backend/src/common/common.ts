import { version } from '../../package.json';

export const currentVersion: string = version;

export async function sleep(ms: number): Promise<void> {
    await new Promise<void>((res) => {
        setTimeout(res, ms);
    });
}
