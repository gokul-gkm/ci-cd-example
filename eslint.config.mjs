import globals from "globals";
import js from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
  },
  js.configs.recommended,
  {
    rules: {
      
    },
  },
];