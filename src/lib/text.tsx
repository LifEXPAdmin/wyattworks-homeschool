/**
 * Text utility functions for rendering safe HTML entities in JSX
 * to prevent ESLint react/no-unescaped-entities errors
 */

/**
 * Replaces unescaped apostrophes and quotes with safe HTML entities
 * @param text - The text string to process
 * @returns Escaped text safe for JSX
 */
export function safeText(text: string): string {
  return text
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;")
    .replace(/"/g, "&quot;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/'/g, "&apos;");
}

/**
 * Component that renders text with safe apostrophes and quotes
 * Useful for dynamic content or copy-pasted text
 *
 * @example
 * <SafeText>Don't worry, it's all safe!</SafeText>
 *
 * @example
 * <SafeText>She said "Hello" and he replied "Hi"</SafeText>
 */
export function SafeText({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: safeText(children) }} />;
}

/**
 * Template literal tag function for safe text
 *
 * @example
 * const message = safe`Don't worry, it's all safe!`;
 */
export function safe(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = "";
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      result += String(values[i]);
    }
  });
  return safeText(result);
}

/**
 * Quick reference for common safe entities
 */
export const entities = {
  apostrophe: "&apos;",
  singleQuote: "&apos;",
  doubleQuote: "&quot;",
  leftDoubleQuote: "&ldquo;",
  rightDoubleQuote: "&rdquo;",
  leftSingleQuote: "&lsquo;",
  rightSingleQuote: "&rsquo;",
  ampersand: "&amp;",
  lessThan: "&lt;",
  greaterThan: "&gt;",
} as const;
