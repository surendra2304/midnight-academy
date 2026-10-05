/**
 * Structural JSON types for payload data that crosses the TanStack Start
 * server-function serialization boundary.
 *
 * `Record<string, unknown>` cannot be returned from a server function (the
 * serializer's `ValidateSerializable` mapped type rejects `unknown`), while
 * `Record<string, any>` throws type safety away for every consumer. This union
 * keeps both properties: every member is a primitive or an index-signature
 * object, so it passes validation, and readers must still narrow before use.
 *
 * Arrays are intentionally `readonly JsonValue[]` — the bare `JsonValue[]`
 * member distributes into the readonly array branch of `ValidateSerializable`,
 * whose element check cannot be satisfied by the union itself.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Index-signature form of {@link JsonValue}. Object literals and type aliases of
 * object literal types satisfy this shape (interfaces do not, since they carry
 * no implicit index signature), so seeded blueprint content assigns directly.
 */
export type JsonRecord = { [key: string]: JsonValue };
