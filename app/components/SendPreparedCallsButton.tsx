"use client";

import { useWallet } from "../context/WalletContext";
import { StepButton } from "./StepButton";

export function SendPreparedCallsButton() {
  const { isSigned, prepareCallsData, signData, setIsSent } = useWallet();

  const handleSendPreparedCalls = async () => {
    if (!prepareCallsData) {
      throw new Error("No prepared calls to send");
    }

    if (!signData) {
      throw new Error("No signature available");
    }

    // Use the key from prepareCallsData, or fallback to a default key structure
    const key = prepareCallsData.key || {
      publicKey:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      type: "webauthn-p256" as const,
    };

    // Call wallet_sendPreparedCalls via JSON-RPC
    const response = await fetch("/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "wallet_sendPreparedCalls",
        params: [
          {
            capabilities: prepareCallsData.capabilities,
            chainId: prepareCallsData.chainId,
            context: prepareCallsData.context,
            key,
            signature: signData.signature,
            version: prepareCallsData.version,
          },
        ],
        id: 2,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Mark as sent in context
    setIsSent(true);

    return {
      summary: "Calls sent successfully!",
      details: result.result,
    };
  };

  return (
    <StepButton
      label="Send Prepared Calls"
      disabled={!isSigned}
      onExecute={handleSendPreparedCalls}
      onComplete={() => {}}
    />
  );
}

