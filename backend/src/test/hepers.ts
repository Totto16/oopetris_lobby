export async function sleep(ms: number): Promise<void> {
    await new Promise<void>((res) => {
        setTimeout(res, ms);
    });
}

export type Optional<T> = T | null;

export async function waitUntilDoesNotThrow(
    fn: () => Promise<void> | void,
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        try {
            await fn();
            return;
        } catch (_e) {
            await sleep(10);
        }
    }
}
