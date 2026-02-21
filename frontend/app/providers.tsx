'use client';

import { AnchorProvider, setProvider } from '@coral-xyz/anchor';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useEffect, useMemo } from 'react';

function AnchorProviderSync({ endpoint }: { endpoint: string }) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const wallet = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
  }, [publicKey, signTransaction, signAllTransactions]);

  const provider = useMemo(() => {
    if (!wallet) return null;
    const connection = new Connection(endpoint, 'confirmed');
    return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  }, [endpoint, wallet]);

  useEffect(() => {
    if (provider) setProvider(provider);
  }, [provider]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AnchorProviderSync endpoint={endpoint} />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
