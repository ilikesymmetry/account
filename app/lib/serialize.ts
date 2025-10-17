import { Hex } from "ox";

/**
 * Type that recursively converts BigInt to Hex string in a type
 */
export type SerializeBigInt<T> = T extends bigint
  ? Hex.Hex
  : T extends Array<infer U>
  ? Array<SerializeBigInt<U>>
  : T extends object
  ? { [K in keyof T]: SerializeBigInt<T[K]> }
  : T;

/**
 * Deeply converts all BigInt values in an object to hex strings.
 * Preserves the structure of the input while making it JSON-serializable.
 *
 * @param value - The value to serialize (can be any type)
 * @returns A deep copy with all BigInts converted to hex strings
 *
 * @example
 * ```ts
 * const data = {
 *   id: "abc",
 *   publicKey: { x: 12345n, y: 67890n },
 *   nested: [{ value: 999n }]
 * };
 *
 * const serialized = serializeBigInt(data);
 * // {
 * //   id: "abc",
 * //   publicKey: { x: "0x3039", y: "0x10932" },
 * //   nested: [{ value: "0x3e7" }]
 * // }
 * ```
 */
export function serializeBigInt<T>(value: T): SerializeBigInt<T> {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return value as SerializeBigInt<T>;
  }

  // Handle BigInt - convert to hex
  if (typeof value === "bigint") {
    return Hex.fromNumber(value) as SerializeBigInt<T>;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item)) as SerializeBigInt<T>;
  }

  // Handle objects (but not special types like Date, RegExp, etc.)
  if (typeof value === "object" && value.constructor === Object) {
    const result: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = serializeBigInt(value[key]);
      }
    }
    return result as SerializeBigInt<T>;
  }

  // Handle all other types (string, number, boolean, functions, etc.)
  return value as SerializeBigInt<T>;
}
