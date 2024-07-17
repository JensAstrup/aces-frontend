const nextConfig = require('eslint-config-next');
const baseConfig = require('eslint-config-yenz');

module.exports = {
  "parserOptions": {
    "project": "./tsconfig.json",
  },
  "plugins": [
    ...baseConfig.plugins,
    'jest'
  ],
  "extends": [
    ...baseConfig.extends,
    "next",
    "next/core-web-vitals"
  ],
  "rules": {
    ...baseConfig.rules,
    '@typescript-eslint/explicit-function-return-type': 'off',
    "no-console": 'off',
    "no-extra-boolean-cast": 0,
    "indent": ["warn", 2],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@aces/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": [
          "builtin"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "settings": {
    "node": {
      "tryExtensions": [".js", ".json", ".node", ".ts"]
    }
  },
  "overrides": [
    {
      files: ["**/*.test.*"],
      rules: {
        "no-magic-numbers": "off"
      }
    }
  ]
};
