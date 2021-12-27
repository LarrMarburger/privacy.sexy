module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    // Vue specific rules, eslint-plugin-vue
    // Added by Vue CLI
    'plugin:vue/essential',

    // Extends eslint-config-airbnb
    // Added by Vue CLI
    // Here until https://github.com/vuejs/eslint-config-airbnb/issues/23 is done
    '@vue/airbnb',

    // Extends @typescript-eslint/recommended
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    // Added by Vue CLI
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off', // process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': 'off', // process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    'linebreak-style': 'off',
    'no-useless-constructor': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-use-before-define': 'off',
    'no-restricted-syntax': 'off',
    'global-require': 'off',
    'max-len': 'off',
    'import/no-unresolved': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'import/extensions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-plusplus': 'off',
    'no-mixed-operators': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-return-assign': 'off',
    'no-await-in-loop': 'off',
    'no-shadow': 'off',
    'vuejs-accessibility/accessible-emoji': 'off',
    'no-promise-executor-return': 'off',
    'no-new': 'off',
    'no-useless-escape': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',
    'no-irregular-whitespace': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'camelcase': 'off',
    'no-restricted-globals': 'off',
    'default-param-last': 'off',
    'no-continue': 'off',
    'vuejs-accessibility/anchor-has-content': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    'no-multi-spaces': 'off',
    'indent': 'off',
    'comma-dangle': 'off',
    'semi': 'off',
    'quotes': 'off',
    'key-spacing': 'off',
    'lines-between-class-members': 'off',
    'import/order': 'off',
    'space-in-parens': 'off',
    'array-bracket-spacing': 'off',
    'object-curly-spacing': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'import/no-duplicates': 'off',
    'function-paren-newline': 'off',
    'operator-linebreak': 'off',
    'no-multiple-empty-lines': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
    'arrow-body-style': 'off',
    'no-useless-return': 'off',
    'prefer-template': 'off',
    'func-call-spacing': 'off',
    'no-spaced-func': 'off',
    'padded-blocks': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-call-argument-newline': 'off',
    'comma-spacing': 'off',
    'comma-style': 'off',
    'newline-per-chained-call': 'off',
    'no-useless-computed-key': 'off',
    'no-else-return': 'off',
    'quote-props': 'off',
    'no-restricted-properties': 'off',
    'prefer-exponentiation-operator': 'off',
    'semi-spacing': 'off',
    'prefer-object-spread': 'off',
    'import/newline-after-import': 'off',
    'strict': 'off',
    'no-trailing-spaces': 'off',
    'no-confusing-arrow': 'off',
    'eol-last': 'off',
    'import/no-useless-path-segments': 'off',
    'spaced-comment': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
