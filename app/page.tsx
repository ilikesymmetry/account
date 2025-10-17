"use client";

import { WalletProvider } from "./context/WalletContext";
import {
  CreateAccountButton,
  LoginButton,
  PrepareCallsButton,
  SignButton,
  SendPreparedCallsButton,
} from "./components";

export default function Home() {
  return (
    <WalletProvider>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          {/* <CreateAccountButton /> */}
          <LoginButton />
          <PrepareCallsButton />
          <SignButton />
          <SendPreparedCallsButton />
        </div>
      </div>
    </WalletProvider>
  );
}
