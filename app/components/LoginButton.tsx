"use client";

import * as ox from "ox";
import { useWallet } from "../context/WalletContext";
import { StepButton } from "./StepButton";

export function LoginButton() {
  const { setLoginData, isLoggedIn } = useWallet();

  const handleLogin = async () => {
    // Create a challenge for the authentication
    const challenge = ox.Bytes.random(32);

    // Get the credential using WebAuthn
    const credentialResponse = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        timeout: 60000,
        rpId: window.location.hostname,
        userVerification: "preferred",
      },
    });

    if (!credentialResponse) {
      throw new Error("No credential returned");
    }

    const publicKeyCredential = credentialResponse as PublicKeyCredential;
    const response =
      publicKeyCredential.response as AuthenticatorAssertionResponse;

    // Parse the WebAuthn response
    const authenticatorData = new Uint8Array(response.authenticatorData);
    const clientDataJSON = new Uint8Array(response.clientDataJSON);
    const signature = new Uint8Array(response.signature);

    const credential = {
      id: publicKeyCredential.id,
      rawId: ox.Bytes.toHex(new Uint8Array(publicKeyCredential.rawId)),
      authenticatorData: ox.Bytes.toHex(authenticatorData),
      clientDataJSON: new TextDecoder().decode(clientDataJSON),
      signature: ox.Bytes.toHex(signature),
    };

    console.log("WebAuthn credential:", publicKeyCredential);

    // Store in context
    setLoginData({ credential });

    return {
      summary: "Successfully signed in with WebAuthn!",
      details: credential,
    };
  };

  return (
    <StepButton
      label="Log In"
      disabled={false}
      onExecute={handleLogin}
      onComplete={() => {}}
    />
  );
}

