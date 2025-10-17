import * as ox from "ox";
import { UserOperation } from "viem/account-abstraction";

// EIP-7836 shared types

export interface Key {
  prehash?: boolean;
  publicKey: ox.Hex.Hex;
  type: "secp256k1" | "p256" | "webauthn-p256" | "webcrypto-p256";
}

export interface Call {
  to: ox.Address.Address;
  data?: ox.Hex.Hex;
  value?: ox.Hex.Hex;
  capabilities?: Record<string, any>;
}

// wallet_prepareCalls types
export interface PrepareCallsParams {
  calls: Call[];
  capabilities?: Record<string, any>;
  chainId: ox.Hex.Hex;
  from?: ox.Address.Address;
  key?: Key;
  version: string;
}

export interface PrepareCallsResponse {
  capabilities: Record<string, any>;
  chainId: ox.Hex.Hex;
  context: { type: "user-operation-v06"; data: UserOperation<"0.6"> };
  key?: Key;
  digest: ox.Hex.Hex;
  version: string;
}

// wallet_sendPreparedCalls types
export interface SendPreparedCallsParams {
  capabilities: Record<string, any>;
  chainId: ox.Hex.Hex;
  context: { type: "user-operation-v06"; data: UserOperation<"0.6"> };
  key: Key;
  signature: ox.Hex.Hex;
  version: string;
}

export interface SendPreparedCallsResponse {
  id: string;
  capabilities: Record<string, any>;
}
