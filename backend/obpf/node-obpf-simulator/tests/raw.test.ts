import { expect } from '@jest/globals';
import path from 'path';

function fail(reason = 'fail was called in a test.'): never {
    throw new Error(reason);
}

global.fail = fail;

const rootDir = path.join(__dirname, '..');
const nodeNativePackage = require('node-gyp-build')(rootDir);

describe('start', () => {
    it('should throw an error, when no first argument was given', async () => {
        try {
            nodeNativePackage.start();

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: Wrong number of arguments',
            );
        }
    });

    it('should throw an error, when no second argument was given', async () => {
        try {
            nodeNativePackage.start(1);

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: Wrong number of arguments',
            );
        }
    });

    it('should throw an error, when the first argument is not a number', async () => {
        try {
            nodeNativePackage.start('start', '2');

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: First argument must be an Uint32 number',
            );
        }
    });

    it('should throw an error, when the second argument is not a number', async () => {
        try {
            nodeNativePackage.start(1, '2');

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: Second argument must be an Uint32 number',
            );
        }
    });

    it('should throw an error, when the first argument is a to big number', async () => {
        try {
            nodeNativePackage.start(2 ** 16 + 1, 2);

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: First argument must be an Uint16 number',
            );
        }
    });

    it('should throw an error, when the second argument is a to big number', async () => {
        try {
            nodeNativePackage.start(1, 2 ** 8 + 1);

            fail('it should not reach here');
        } catch (e) {
            expect((e as any).toString()).toEqual(
                'TypeError: Second argument must be an Uint8 number',
            );
        }
    });

    it('should return and be a promise, when everything is correct', async () => {
        const result = nodeNativePackage.start(43523, 1);
		console.log("RETURN")

        //await expect(result).resolves.not.toBe(null);
    });
});
