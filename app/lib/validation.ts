import * as ox from "ox";
import type { Key, Call } from "./types";

/**
 * Validates a Key object according to EIP-7836 spec
 */
export function validateKey(key: any): Key {
  if (typeof key !== "object" || key === null) {
    throw new Error("Invalid 'key': must be an object");
  }

  // Validate 'prehash' field (optional)
  if (key.prehash !== undefined && typeof key.prehash !== "boolean") {
    throw new Error("Invalid 'key.prehash': must be a boolean");
  }

  // Validate 'publicKey' field (required)
  if (typeof key.publicKey !== "string") {
    throw new Error("Invalid 'key.publicKey': must be a string");
  }

  try {
    ox.Hex.assert(key.publicKey);
  } catch (error) {
    throw new Error(
      `Invalid 'key.publicKey': must be a hexadecimal string (got: ${key.publicKey})`
    );
  }

  // Validate 'type' field (required)
  if (
    key.type !== "secp256k1" &&
    key.type !== "p256" &&
    key.type !== "webauthn-p256" &&
    key.type !== "webcrypto-p256"
  ) {
    throw new Error(
      `Invalid 'key.type': must be one of 'secp256k1', 'p256', 'webauthn-p256', or 'webcrypto-p256' (got: ${key.type})`
    );
  }

  return {
    ...(key.prehash !== undefined && { prehash: key.prehash }),
    publicKey: key.publicKey as ox.Hex.Hex,
    type: key.type,
  };
}

/**
 * Validates a Call object according to EIP-7836 spec
 */
export function validateCall(call: any, index: number): Call {
  if (typeof call !== "object" || call === null) {
    throw new Error(`Invalid call at index ${index}: must be an object`);
  }

  // Validate 'to' field (required)
  if (typeof call.to !== "string") {
    throw new Error(`Invalid call at index ${index}: 'to' must be a string`);
  }

  try {
    ox.Address.assert(call.to);
  } catch (error) {
    throw new Error(
      `Invalid call at index ${index}: 'to' must be a valid Ethereum address (got: ${call.to})`
    );
  }

  // Validate 'data' field (optional)
  if (call.data !== undefined) {
    if (typeof call.data !== "string") {
      throw new Error(
        `Invalid call at index ${index}: 'data' must be a string`
      );
    }
    try {
      ox.Hex.assert(call.data);
    } catch (error) {
      throw new Error(
        `Invalid call at index ${index}: 'data' must be a hexadecimal string (got: ${call.data})`
      );
    }
  }

  // Validate 'value' field (optional)
  if (call.value !== undefined) {
    if (typeof call.value !== "string") {
      throw new Error(
        `Invalid call at index ${index}: 'value' must be a string`
      );
    }
    try {
      ox.Hex.assert(call.value);
    } catch (error) {
      throw new Error(
        `Invalid call at index ${index}: 'value' must be a hexadecimal string (got: ${call.value})`
      );
    }
  }

  // Validate 'capabilities' field (optional)
  if (call.capabilities !== undefined) {
    if (typeof call.capabilities !== "object" || call.capabilities === null) {
      throw new Error(
        `Invalid call at index ${index}: 'capabilities' must be an object`
      );
    }
  }

  return {
    to: call.to as ox.Address.Address,
    ...(call.data !== undefined && { data: call.data as ox.Hex.Hex }),
    ...(call.value !== undefined && { value: call.value as ox.Hex.Hex }),
    ...(call.capabilities !== undefined && { capabilities: call.capabilities }),
  };
}

/**
 * Validates that params is an array with at least one element
 */
export function validateParamsArray(params: unknown): any[] {
  if (!Array.isArray(params)) {
    throw new Error("Invalid parameters: must be an array");
  }

  if (params.length === 0) {
    throw new Error(
      "Invalid parameters: array must contain at least one element"
    );
  }

  return params;
}

/**
 * Validates that a value is an object
 */
export function validateObject(value: any, fieldName: string): any {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid parameters: ${fieldName} must be an object`);
  }
  return value;
}

/**
 * Validates a hex string field
 */
export function validateHexField(
  value: any,
  fieldName: string,
  required: boolean = true
): ox.Hex.Hex | undefined {
  if (required && value === undefined) {
    throw new Error(`Invalid parameters: '${fieldName}' is required`);
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid parameters: '${fieldName}' must be a string`);
  }

  try {
    ox.Hex.assert(value);
  } catch (error) {
    throw new Error(
      `Invalid parameters: '${fieldName}' must be a hexadecimal string (got: ${value})`
    );
  }

  return value as ox.Hex.Hex;
}

/**
 * Validates an Ethereum address field
 */
export function validateAddressField(
  value: any,
  fieldName: string,
  required: boolean = true
): ox.Address.Address | undefined {
  if (required && value === undefined) {
    throw new Error(`Invalid parameters: '${fieldName}' is required`);
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid parameters: '${fieldName}' must be a string`);
  }

  try {
    ox.Address.assert(value);
  } catch (error) {
    throw new Error(
      `Invalid parameters: '${fieldName}' must be a valid Ethereum address (got: ${value})`
    );
  }

  return value as ox.Address.Address;
}

/**
 * Validates a string field
 */
export function validateStringField(
  value: any,
  fieldName: string,
  required: boolean = true
): string | undefined {
  if (required && value === undefined) {
    throw new Error(`Invalid parameters: '${fieldName}' is required`);
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid parameters: '${fieldName}' must be a string`);
  }

  return value;
}

/**
 * Validates a capabilities object
 */
export function validateCapabilities(
  value: any,
  fieldName: string,
  required: boolean = false
): Record<string, any> | undefined {
  if (required && value === undefined) {
    throw new Error(`Invalid parameters: '${fieldName}' is required`);
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid parameters: '${fieldName}' must be an object`);
  }

  return value;
}
