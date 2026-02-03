// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            'no-console': 'off',
            'dot-notation': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'off',
        },
    },
    {
        ignores: [
            'dist',
            'node_modules',
            'eslint.config.mjs',
            'tsconfig.json',
            'vitest.config.ts',
            'tsconfig.vitest.json',
            '*.spec.ts',
            'tests'
        ],
    },
);
