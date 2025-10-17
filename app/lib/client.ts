import { http, createPublicClient } from "viem";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { baseSepolia } from "viem/chains";

const CDP_RPC = `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}`;

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(CDP_RPC),
});

export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(CDP_RPC),
});

export const paymasterClient = createPaymasterClient({
  transport: http(CDP_RPC),
});
