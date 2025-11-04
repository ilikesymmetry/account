"use client";

import { baseSepolia } from "viem/chains";
import { useWallet } from "../context/WalletContext";
import { StepButton } from "./StepButton";
import { toHex } from "viem";
import { CONNER_PUBLIC_KEY } from "../lib/constants";
import { Attribution } from "ox/erc8021";

export function PrepareCallsButton() {
  const { isLoggedIn, loginData, setPrepareCallsData } = useWallet();

  const handlePrepareCalls = async () => {
    if (!loginData) {
      throw new Error("No login data available");
    }

    // Call wallet_prepareCalls via JSON-RPC
    const response = await fetch("/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "wallet_prepareCalls",
        params: [
          {
            calls: [    
              {
                to: "0x0000000000000000000000000000000000000000", // Zero address
                data: "0x", // Empty bytes
                value: "0x0", // Zero value
              },
            ],
            key: {
                publicKey: CONNER_PUBLIC_KEY,
                type: "webauthn-p256"
            },
            chainId: toHex(baseSepolia.id),
            version: "1.0",
            capabilities: {
              "dataSuffix": Attribution.toDataSuffix({codes: ["account"]})
            }
          },
        ],
        id: 1,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Store the response in context
    setPrepareCallsData(result.result);

    return {
      summary: "Calls prepared successfully!",
      details: result.result,
    };
  };

  return (
    <StepButton
      label="Prepare Calls"
      disabled={!isLoggedIn}
      onExecute={handlePrepareCalls}
      onComplete={() => {}}
    />
  );
}

