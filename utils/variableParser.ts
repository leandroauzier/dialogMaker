/**
 * Utilities to find and resolve `{{variableName}}` placeholders inside dialogue text.
 */

const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/** Returns the list of variable names referenced as `{{name}}` inside a text. */
export function extractVariableNames(text: string | undefined | null): string[] {
  if (!text) return [];
  const names = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(VARIABLE_REGEX);
  while ((match = regex.exec(text)) !== null) {
    names.add(match[1]);
  }
  return Array.from(names);
}

/** Replaces every `{{variableName}}` occurrence in `text` with its value from `variables`. */
export function resolveVariables(
  text: string | undefined | null,
  variables: Record<string, string | number | boolean>
): string {
  if (!text) return "";
  return text.replace(VARIABLE_REGEX, (_, name: string) => {
    const value = variables[name];
    if (value === undefined || value === null) return `{{${name}}}`;
    return String(value);
  });
}
