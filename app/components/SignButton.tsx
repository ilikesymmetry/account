"use client";

import * as ox from "ox";
import { useWallet } from "../context/WalletContext";
import { StepButton } from "./StepButton";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { CONNER_PUBLIC_KEY } from "../lib/constants";
import { toAccount } from "../lib/account";
import { isErc6492Signature, parseErc6492Signature } from "viem";

export function SignButton() {
  const { isCallsPrepared, prepareCallsData, loginData, setSignData } =
    useWallet();

  const handleSign = async () => {
    if (!prepareCallsData) {
      throw new Error("No prepared calls to sign");
    }

    if (!loginData) {
      throw new Error("No login data available");
    }

    // Sign the digest using WebAuthn
    const digest = prepareCallsData.digest as ox.Hex.Hex;
    console.log({digest})
    
    // Use the credential from login to avoid re-selecting
    const credentialId = loginData.credential.id
    console.log({credentialId})
    
    const owner = toWebAuthnAccount({ credential: {
      id: credentialId,
      publicKey: CONNER_PUBLIC_KEY
    } })
    console.log({owner})
    const account = await toAccount(owner);
    console.log({account})

    let signature = await account.signUserOperation(prepareCallsData.context.data)
    if (isErc6492Signature(signature)) {
      const {signature: innerSignature} = parseErc6492Signature(signature)
      signature = innerSignature;
    }
    console.log("signature:", signature)

    const signData = {
      signature
    };

    // Store in context
    setSignData(signData);

    return {
      summary: "Signed successfully with passkey!",
      details: signData,
    };
  };

  return (
    <StepButton
      label="Sign"
      disabled={!isCallsPrepared}
      onExecute={handleSign}
      onComplete={() => {}}
    />
  );
}

