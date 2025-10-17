import { useCallback, useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { generateMessageToSign } from "@dynamic-labs/multi-wallet";
import { generateSiweNonce } from 'viem/siwe';

const CONFIG = {
  chainId: 1,
  domain: typeof window !== 'undefined' ? window.location.host : 'myawesome.app',
  uri: typeof window !== 'undefined' ? window.location.href : 'http://myawesome.app',
  apiHost: process.env.NEXT_PUBLIC_API_HOST || '/external-api',
} as const;

const useSIWE = () => {
  const { user, primaryWallet } = useDynamicContext();
  const siweData = useMemo(() => {
    if (!user?.verifiedCredentials?.[0]?.address) return null;
    const nonce = generateSiweNonce();
    const requestId = crypto.randomUUID();
    return { nonce, requestId };
  }, [user]);
  

  const message = useMemo(() => {
    if (!siweData || !user?.verifiedCredentials?.[0]?.address) return '';
    return generateMessageToSign({
      blockchain: 'EVM',
      chainId: CONFIG.chainId,
      domain: `http://${CONFIG.domain}/`,
      nonce: siweData.nonce,
      publicKey: user.verifiedCredentials[0].address ?? '',
      requestId: siweData.requestId,
      uri: CONFIG.uri,
      statement: 'We can also get nonce and other payload from the backend.',
    });
  }, [siweData, user]);

  const signMessage = useCallback(async (message: string): Promise<string | undefined> => {
    const publicKey = await primaryWallet?.signMessage(message);
    return publicKey;
  }, [primaryWallet])

  // TODO: make that just a function, not React form action
  const verrifyMessageAction = useCallback(async (currentState: string | null, formData: FormData): Promise<string | null>  => {
    const messageFromTextArea = formData.get('message') as string;
    try {
      const signature = await signMessage(messageFromTextArea);
      const res = await fetch(`${CONFIG.apiHost}/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageFromTextArea, signature }),
      });
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      // todo: remove that line
      delete data.originalMessage;
      return JSON.stringify(data, null, 2)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return `Failed: ${msg}`;
    }
  }, [primaryWallet, message]);

  return { siweData, message, verrifyMessageAction };
}

export default useSIWE;