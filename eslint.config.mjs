import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Allow apostrophes and quotes in JSX text content
      // But still enforce proper escaping in attributes
      // Use &apos; &quot; or our SafeText utility from @/lib/text for dynamic content
      "react/no-unescaped-entities": [
        "error",
        {
          forbid: [
            {
              char: ">",
              alternatives: ["&gt;"],
            },
            {
              char: "}",
              alternatives: ["&#125;"],
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
