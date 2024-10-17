const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const jest = require('eslint-plugin-jest');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    {
        plugins: {
            tseslint: tseslint.plugin,
            eslint: eslint,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            jest: jest,
        },
    },
    {
        ignores: ['dist/**', 'coverage/**', 'jest.config.ts'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: '.',
                projectService: true,
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
    },
    {
        files: ['**/*.ts'],
        ignores: ['test', 'jest.config.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: '.',
            },
        },
    },
    {
        files: ['test/**/*.spec.ts', 'jest.config.ts'],
        ignores: [],
        rules: {
            'jest/prefer-expect-assertions': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.test.json',
                tsconfigRootDir: '.',
            },
        },
    },
    eslintConfigPrettier,
];
