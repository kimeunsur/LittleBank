module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
    commonjs: true
  },
  parser: '@typescript-eslint/parser',
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
    'plugin:mocha/recommended',
    'plugin:chai-expect/recommended',
    'plugin:security/recommended',
    'plugin:you-dont-need-lodash-underscore/compatible'
  ],
  ignorePatterns: ['src/public'],
  plugins: ['chai-expect', 'promise', 'prettier', 'security'],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    'prettier/prettier': ['error'],
    camelcase: 0,
    'consistent-return': 0,
    'dot-notation': 0,
    'func-names': 0,
    'global-require': 0,
    'lines-between-class-members': 0,
    'max-classes-per-file': 0,
    'no-await-in-loop': 0,
    'no-bitwise': 0,
    'no-case-declarations': 0,
    'no-continue': 0,
    'no-empty': 0,
    'no-empty-function': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0,
    'no-useless-catch': 0,
    'no-useless-escape': 0,
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
    'no-prototype-builtins': 0,
    'no-return-assign': 0,
    'no-return-await': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': 0,
    'no-unused-expressions': 0,
    'no-use-before-define': 0,
    'no-shadow': 0,
    'no-restricted-globals': 0,
    'one-var': 0,
    'prefer-destructuring': 0,
    'spaced-comment': 0,
    'import/extensions': 0,
    'import/no-named-as-default-member': 0,
    'import/no-dynamic-require': 0,
    'import/no-named-as-default': 0,
    'import/no-unresolved': 0,
    'import/no-useless-path-segments': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    'promise/always-return': 0,
    'promise/catch-or-return': 0,
    'promise/no-nesting': 0,
    'mocha/no-hooks-for-single-case': 0,
    'mocha/no-setup-in-describe': 0,
    'security/detect-non-literal-fs-filename': 0,
    'security/detect-non-literal-require': 0,
    'security/detect-object-injection': 0,
    'security/detect-possible-timing-attacks': 0
  }
}
