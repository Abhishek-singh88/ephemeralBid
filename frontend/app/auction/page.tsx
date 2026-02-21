'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { BN, Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { IDL, Ephemeralbid } from '../lib/ephemeralbid';

const PROGRAM_ID = new PublicKey('HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE');

export default function AuctionPage() {
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<Ephemeralbid> | null>(null);
  const [status, setStatus] = useState('Connect wallet to create auction');

  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      setStatus('Connect wallet first');
      setProgram(null);
      return;
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: 'confirmed' }
    );

    const prog = new Program<Ephemeralbid>(IDL, provider);
    setProgram(prog);
    setStatus('Ready to create auction');
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const createAuction = async () => {
    if (!program || !wallet.publicKey) {
      setStatus('❌ No program/wallet');
      return;
    }

    setStatus('Creating auction...');
    
    try {
      // FIXED PDA SEEDS from your IDL
      const auctionIdBytes = new BN(1).toArrayLike(Buffer, 'le', 8);
      const [auctionHouse] = PublicKey.findProgramAddressSync(
        [Buffer.from("auction"), wallet.publicKey!.toBuffer(), auctionIdBytes],
        PROGRAM_ID
      );
      
      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), auctionHouse.toBuffer()],
        PROGRAM_ID
      );

      console.log('📍 Auction:', auctionHouse.toString());
      console.log('📍 Vault:', vault.toString());

      const txSig = await program.methods
        .create_auction(new BN(1), new BN(1000000), new BN(100000), new BN(3600))
        .accounts({
          auctionHouse,
          vault,
          authority: wallet.publicKey!,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        } as any)
        .rpc();

      setStatus(`✅ Created! TX: ${txSig}`);
      console.log('TX:', txSig);
    } catch (error: any) {
      console.error('ERROR:', error);
      setStatus(`❌ ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          EphemeralBid 🥷
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 mb-8">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 mb-4" />
          <p className="text-white/80 text-lg">{status}</p>
          
          {wallet.connected && program && (
            <button
              onClick={createAuction}
              className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-xl"
            >
              🏪 Create Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
