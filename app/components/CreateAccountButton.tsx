"use client";

import { WebAuthnP256 } from "ox";
import { StepButton } from "./StepButton";

export function CreateAccountButton() {
  const handleCreateAccount = async () => {
    // Create the credential using ox WebAuthnP256
    const credential = await WebAuthnP256.createCredential({
      name: "ilikesymmetry/account",
    });

    // Console log the entire return
    console.log("Created passkey credential:", credential);

    // Get existing credentials from localStorage or create new object
    const existingCredentials = localStorage.getItem("passkeys");
    const credentialsObject = existingCredentials
      ? JSON.parse(existingCredentials)
      : {};

    // Save to localStorage keyed by credential ID
    credentialsObject[credential.id] = credential;
    localStorage.setItem("passkeys", JSON.stringify(credentialsObject));

    console.log("Saved to localStorage:", {
      key: "passkeys",
      credentialId: credential.id,
      fullObject: credentialsObject,
    });

    return {
      summary: "Account created successfully with new passkey!",
      details: credential,
    };
  };

  return (
    <StepButton
      label="Create Account"
      disabled={false}
      onExecute={handleCreateAccount}
      onComplete={() => {}}
    />
  );
}

