module.exports = {
    root: true,
    env: {
        node: true, 
        es2021: true,
    },
    extends: [
        'eslint:recommended', // Uses the recommended rules from ESLint.
        'prettier', // Uses Prettier rules.
        'plugin:@typescript-eslint/recommended', // Recommended rules for TypeScript.
    ],
    ignorePatterns: ['dist', '.eslintrc.js'], // Patterns to ignore.
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript.
    parserOptions: {
        ecmaVersion: 'latest', // Allows the parsing of modern ECMAScript features.
        sourceType: 'module', // Allows using import/export statements.
    },
    plugins: ['@typescript-eslint'], // Plugins for TypeScript linting.
    rules: {
        // Basic rules
        'comma-dangle': ['warn', 'never'], // Enforces no trailing commas.
        'max-lines-per-function': ['error', 100], // Enforces a maximum number of lines per function.
        'eol-last': 'error', // Enforces a newline at the end of files.
        'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }], // Disallows unused variables.
        'no-console': 'warn', // Warns on console usage; change to 'error' if you want to enforce this.
        
        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'error', // Disallows usage of the any type.
        '@typescript-eslint/explicit-function-return-type': 'warn', // Enforces explicit return types on functions and class methods.
        
        // Other rules
        'prettier/prettier': 'error', // Enables Prettier linting.
    },
};
