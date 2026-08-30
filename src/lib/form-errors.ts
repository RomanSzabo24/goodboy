/**
 * Recursively collects every validation message out of a react-hook-form
 * `FieldErrors` tree (or a subtree of it, e.g. a single field's own error),
 * including nested object/array fields (e.g. each `contributors[]` entry).
 * Stops descending as soon as it finds a leaf `FieldError` (an object
 * exposing a string `message`) so it never walks into RHF's `ref`/`type`
 * internals.
 */
export function flattenFieldErrors(errors: unknown): string[] {
  const messages: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const message = (node as { message?: unknown }).message;
    if (typeof message === "string") {
      messages.push(message);
      return;
    }
    for (const value of Object.values(node as Record<string, unknown>)) {
      walk(value);
    }
  }

  walk(errors);
  return [...new Set(messages)];
}

/** Same as {@link flattenFieldErrors}, scoped to a subset of top-level fields. */
export function getFieldErrorMessages(errors: unknown, fields: readonly PropertyKey[]): string[] {
  const errorsRecord = errors as Record<PropertyKey, unknown>;
  const messages = fields.flatMap((field) => flattenFieldErrors(errorsRecord?.[field]));
  return [...new Set(messages)];
}
