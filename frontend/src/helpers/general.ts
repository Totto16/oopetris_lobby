/* import { ItemStatus } from './entities';
 */
export function strictEqual(first: unknown, second: unknown): boolean {
    return JSON.stringify(first) === JSON.stringify(second);
}

/* export function prettyStatus(status: ItemStatus): string {
    switch (status) {
        case ItemStatus.Open:
            return 'Open';
        case ItemStatus.InProgress:
            return 'In Progress';
        case ItemStatus.Closed:
            return 'Closed';
    }
} */

export function className(clazz: unknown): string {
    return (clazz as { constructor: { name: string } }).constructor.name;
}

export interface ShakeOptions {
    elementID: string;
    duration?: number;
}

export abstract class Shakeable {
    abstract get shakeOptions(): ShakeOptions;

    private static shakeClassName = 'shake-div';

    private getElement(): HTMLElement {
        const { elementID } = this.shakeOptions;
        const elem = document.getElementById(elementID);
        if (elem === null) {
            throw new Error(
                `Required ID '${elementID}' not found: In class ${className(this)}`,
            );
        }
        return elem;
    }

    formError(): void {
        const { duration } = this.shakeOptions;
        const elem = this.getElement();

        if (elem.classList.contains(Shakeable.shakeClassName)) {
            return;
        }

        elem.classList.add(Shakeable.shakeClassName);
        setTimeout(() => {
            elem.classList.remove(Shakeable.shakeClassName);
        }, duration ?? 500);

        return;
    }

    cancelFormError(): void {
        const elem = this.getElement();

        if (elem.classList.contains(Shakeable.shakeClassName)) {
            elem.classList.remove(Shakeable.shakeClassName);
        }
    }
}

export class ShakeableBaseImpl extends Shakeable {
    override get shakeOptions(): ShakeOptions {
        return this.options;
    }

    constructor(private readonly options: ShakeOptions) {
        super();
    }
}

export function shakeError(options: ShakeOptions): void {
    return new ShakeableBaseImpl(options).formError();
}
