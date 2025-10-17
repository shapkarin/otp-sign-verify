"use client"; // TODO

import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CONSTANTS from '@/constants';

const TODO_REMOVE_THAT = false;

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: CONSTANTS.NEXT_PUBLIC_DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        // TODO: add WAGMI instead
        siweStatement: `My random message ${Math.random()}`,
      }}
    >
      <QueryClientProvider client={queryClient}>
        {TODO_REMOVE_THAT && <DynamicWidget />}
        {children}
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}