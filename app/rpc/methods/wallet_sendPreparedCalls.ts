import * as ox from "ox";
import type {
  SendPreparedCallsParams,
  SendPreparedCallsResponse,
} from "../../lib/types";
import {
  validateKey,
  validateParamsArray,
  validateObject,
  validateHexField,
  validateStringField,
  validateCapabilities,
} from "../../lib/validation";
import { bundlerClient } from "@/app/lib/client";
import {
  entryPoint06Address,
  formatUserOperationRequest,
} from "viem/account-abstraction";

// Handler for wallet_sendPreparedCalls method
export async function handleWalletSendPreparedCalls(
  params: unknown
): Promise<SendPreparedCallsResponse> {
  // Validate parameters according to EIP-7836
  const validatedParams = validateSendPreparedCallsParams(params);
  console.log("wallet_sendPreparedCalls called with params:", validatedParams);

  const res = await bundlerClient.request({
    method: "eth_sendUserOperation",
    params: [
      formatUserOperationRequest(validatedParams.context.data),
      entryPoint06Address,
    ],
  });
  console.log("res:", res);

  return {
    id: ox.Hex.fromNumber(Date.now()), // Unique identifier for the sent calls
    capabilities: validatedParams.capabilities,
  };
}

function validateSendPreparedCallsParams(
  params: unknown
): SendPreparedCallsParams {
  // params is an array with one element
  const paramsArray = validateParamsArray(params);
  const paramObj = validateObject(paramsArray[0], "first element");

  // Validate all required fields
  const capabilities = validateCapabilities(
    paramObj.capabilities,
    "capabilities",
    true
  )!;
  const chainId = validateHexField(paramObj.chainId, "chainId", true)!;
  const signature = validateHexField(paramObj.signature, "signature", true)!;
  const version = validateStringField(paramObj.version, "version", true)!;

  // Validate 'context' field (required) - can be any type
  if (paramObj.context === undefined) {
    throw new Error("Invalid parameters: 'context' is required");
  }

  // Validate 'key' field (required)
  if (paramObj.key === undefined) {
    throw new Error("Invalid parameters: 'key' is required");
  }
  const validatedKey = validateKey(paramObj.key);

  return {
    capabilities,
    chainId,
    context: paramObj.context,
    key: validatedKey,
    signature,
    version,
  };
}

// "RPC Request failed.\n\nURL: https://api.developer.coinbase.com/rpc/v1/base-sepolia/h45dwfkbJTfJ3__AD0fxx_l5pnGw6OA6\nRequest body: {\"method\":\"eth_sendUserOperation\",\"params\":[{\"callData\":\"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000\",\"callGasLimit\":\"0x2bb8\",\"initCode\":\"0xba5ed110efdba3d005bfc882d75358acbbb858423ffba36f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004090EDF3FD73A46852888EC8C00C65344E93CE5B075CDA47A6687E338A5A00F6497BCA32BE79D38D57AC5958C8416DB499D10B4CECD968121F7A89260D709D6F1D\",\"maxFeePerGas\":\"0x1e8530\",\"maxPriorityFeePerGas\":\"0x1e8480\",\"nonce\":\"0x199ef98adeb0000000000000000\",\"paymasterAndData\":\"0x709a4bae3db73a8e717aefca13e88512f738b27f000068f19001000000000000a52ea116b8aa4bb2b5fb22f42a95870b010100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006978d2da85dc0a8193cbc08ceed6d2de4dc63eb45ef2b0f6282a02240202c8fe5b65418920db4b2f7401436a042f08a4cf464fd70c1f87847755cbc5d1d47721695c1b\",\"preVerificationGas\":\"0xe52c\",\"sender\":\"0x8062341B506c61df96245713E32D6b50A9f5eD6b\",\"signature\":\"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000\",\"verificationGasLimit\":\"0xc3500\"},\"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789\"]}\n\nDetails: Invalid UserOp signature or paymaster signature\nVersion: viem@2.38.3"
