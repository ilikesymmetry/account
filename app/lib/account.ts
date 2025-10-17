import { CONNER_PUBLIC_KEY } from "./constants";
import { publicClient } from "./client";
import { toCoinbaseSmartAccount } from "viem/account-abstraction";
import { zeroAddress } from "viem";

export async function toAccount(owner: any = zeroAddress) {
  return await toCoinbaseSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.1",
  });
}
