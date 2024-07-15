const nextConfig = require('eslint-config-next')

module.exports = {
  "plugins": [
    'jest'
  ],
  "extends": [
    "next/core-web-vitals",
    // "plugin:node/recommended"
  ],
  "rules": {
    "comma-dangle": ["warn", "always-multiline"],
    "no-console": 1,
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
}
