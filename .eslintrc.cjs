module.exports = {
    env: {
        browser: true,
        commonjs: true,
        node: true,
        es2021: true,
    },
    root: true,
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'google',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    overrides: [
        {
            env: {node: true},
            files: ['.eslintrc.{js,cjs}'],
            extends: ['plugin:@typescript-eslint/disable-type-checked'],
        },
        {
            files: ['src/test-utils.ts', 'perf/*', '**/*.test.ts'],
            rules: {
                'no-invalid-this': 0,
            },
        },
    ],
    ignorePatterns: [
        'dist/*',
    ],
    rules: {
        'indent': ['error', 4],
        'max-len': ['error', 120],
        'require-jsdoc': 0,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
    },
};
