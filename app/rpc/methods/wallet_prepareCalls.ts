import * as ox from "ox";
import type { PrepareCallsParams, PrepareCallsResponse } from "../../lib/types";
import {
  validateCall,
  validateKey,
  validateParamsArray,
  validateObject,
  validateHexField,
  validateAddressField,
  validateStringField,
  validateCapabilities,
} from "../../lib/validation";
import { bundlerClient } from "@/app/lib/client";
import { toAccount } from "@/app/lib/account";
import {
  entryPoint06Address,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import { getUserOperationHash } from "viem/account-abstraction";
import { concat, toNumber } from "ox/Hex";
import { serializeBigInt } from "@/app/lib/serialize";
import type { UserOperation } from "ox/erc4337";
import { CONNER_PUBLIC_KEY } from "@/app/lib/constants";

function validatePrepareCallsParams(params: unknown): PrepareCallsParams {
  // params is an array with one element
  const paramsArray = validateParamsArray(params);
  const paramObj = validateObject(paramsArray[0], "first element");

  // Validate 'calls' field (required)
  if (!Array.isArray(paramObj.calls)) {
    throw new Error("Invalid parameters: 'calls' must be an array");
  }

  if (paramObj.calls.length === 0) {
    throw new Error("Invalid parameters: 'calls' array must not be empty");
  }

  // Validate each call in the array
  const validatedCalls = paramObj.calls.map((call: any, index: number) =>
    validateCall(call, index)
  );

  // Validate optional and required fields using helper functions
  const capabilities = validateCapabilities(
    paramObj.capabilities,
    "capabilities",
    false
  );
  const chainId = validateHexField(paramObj.chainId, "chainId", true)!;
  const from = validateAddressField(paramObj.from, "from", false);
  const version = validateStringField(paramObj.version, "version", true)!;

  // Validate 'key' field (optional)
  let validatedKey = undefined;
  if (paramObj.key !== undefined) {
    validatedKey = validateKey(paramObj.key);
  }

  return {
    calls: validatedCalls,
    ...(capabilities !== undefined && { capabilities }),
    chainId,
    ...(from !== undefined && { from }),
    ...(validatedKey !== undefined && { key: validatedKey }),
    version,
  };
}

// Handler for wallet_prepareCalls method
export async function handleWalletPrepareCalls(
  params: unknown
): Promise<PrepareCallsResponse> {
  // Validate parameters according to EIP-7836
  const validatedParams = validatePrepareCallsParams(params);
  console.log({ validatedParams });

  // Create owner from passkey public key
  const owner = toWebAuthnAccount({
    credential: {
      id: "",
      publicKey: CONNER_PUBLIC_KEY,
    },
  });
  console.log({ owner });

  // Create account with single owner
  const account = await toAccount(owner);
  console.log({ account });

  // Prepare user operation
  let userOperation: any = await bundlerClient.prepareUserOperation({
    account,
    calls: validatedParams.calls,
    // paymaster: true, // use client as 7677 paymaster
  });
  delete userOperation.account;
  console.log({ userOperation });

  // Append dataSuffix to calldata
  const dataSuffix = validatedParams.capabilities?.["dataSuffix"];
  if (dataSuffix) {
    userOperation.callData = concat(userOperation.callData, dataSuffix);
  }

  // Get digest of user operation
  const digest = getUserOperationHash({
    chainId: toNumber(validatedParams.chainId),
    entryPointAddress: entryPoint06Address,
    entryPointVersion: "0.6",
    userOperation: { ...userOperation, sender: account.address },
  });

  return {
    capabilities: validatedParams.capabilities || {},
    chainId: validatedParams.chainId,
    context: {
      // Wallet-specific data to be passed to wallet_sendPreparedCalls
      type: "user-operation-v06",
      data: serializeBigInt(userOperation),
    },
    ...(validatedParams.key && { key: validatedParams.key }),
    digest,
    version: validatedParams.version,
  };
}
