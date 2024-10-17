import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig');

const jestConfig: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: ['<rootDir>'],
    rootDir: '.',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
    },
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        //        '**/?(*.)+(spec|test).[jt]s?(x)',
        '**/app.service.spec.ts',
    ],
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testPathIgnorePatterns: ['/dist/', '/node_modules/'],
    watchPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    watchman: false,
    globalSetup: '<rootDir>/src/test/setup.ts',
};

module.exports = jestConfig;
