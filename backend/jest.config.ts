import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    // [...]
    transform: {
        // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
        '^.+\\.ts$': ['ts-jest', {}],
    },
    testRegex: '.*\\.spec\\.ts$',

    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
};

module.exports = jestConfig;
