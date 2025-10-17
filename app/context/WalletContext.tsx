"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PrepareCallsResponse } from "../lib/types";

interface LoginData {
  credential: {
    id: string;
    rawId: string;
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
}

interface SignData {
  signature: string;
//   digest: string;
//   credentialId: string;
//   authenticatorData: string;
//   clientDataJSON: string;
}

interface WalletContextType {
  // Login state
  loginData: LoginData | null;
  setLoginData: (data: LoginData | null) => void;
  isLoggedIn: boolean;

  // Prepare calls state
  prepareCallsData: PrepareCallsResponse | null;
  setPrepareCallsData: (data: PrepareCallsResponse | null) => void;
  isCallsPrepared: boolean;

  // Sign state
  signData: SignData | null;
  setSignData: (data: SignData | null) => void;
  isSigned: boolean;

  // Send state
  isSent: boolean;
  setIsSent: (sent: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [prepareCallsData, setPrepareCallsData] =
    useState<PrepareCallsResponse | null>(null);
  const [signData, setSignData] = useState<SignData | null>(null);
  const [isSent, setIsSent] = useState(false);

  const value: WalletContextType = {
    loginData,
    setLoginData,
    isLoggedIn: loginData !== null,

    prepareCallsData,
    setPrepareCallsData,
    isCallsPrepared: prepareCallsData !== null,

    signData,
    setSignData,
    isSigned: signData !== null,

    isSent,
    setIsSent,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

