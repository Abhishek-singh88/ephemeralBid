'use client';

import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import { Ephemeralbid, IDL } from '../lib/ephemeralbid';

const PROGRAM_ID = new PublicKey('HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE');
const MAGIC_PROGRAM_ID = new PublicKey('Magic11111111111111111111111111111111111111');
const MAGIC_CONTEXT_ID = new PublicKey('MagicContext1111111111111111111111111111111');
const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');
const EPHEMERAL_ROLLUPS_PROGRAM_ID = new PublicKey(
  new Uint8Array([
    242, 96, 133, 63, 142, 184, 10, 176, 73, 157, 225, 152, 140, 130, 123, 23, 164, 195, 182,
    163, 62, 16, 255, 172, 208, 102, 49, 235, 221, 52, 15, 247,
  ])
);

type FlowMode = 'l1' | 'per';

type ResultState = {
  tx?: string;
  message: string;
};

function toCamel(input: string): string {
  return input.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function parsePubkey(input: string): PublicKey | null {
  try {
    return new PublicKey(input.trim());
  } catch {
    return null;
  }
}

export default function AuctionPage() {
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<Ephemeralbid> | null>(null);
  const [flowMode, setFlowMode] = useState<FlowMode>('l1');

  const [auctionId, setAuctionId] = useState('1');
  const [auctionAuthorityInput, setAuctionAuthorityInput] = useState('');
  const [minBid, setMinBid] = useState('1000000');
  const [minIncrement, setMinIncrement] = useState('100000');
  const [duration, setDuration] = useState('3600');
  const [bidAmount, setBidAmount] = useState('1200000');
  const [settleBidder, setSettleBidder] = useState('');
  const [status, setStatus] = useState<ResultState>({ message: 'Connect wallet to begin' });

  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      setProgram(null);
      setStatus({ message: 'Connect wallet first' });
      return;
    }

    const provider = new AnchorProvider(
      new Connection('https://api.devnet.solana.com', 'confirmed'),
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: 'confirmed' }
    );

    setProgram(new Program<Ephemeralbid>(IDL, provider));
    setStatus({ message: 'Wallet connected. Ready.' });
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  useEffect(() => {
    if (wallet.publicKey && !auctionAuthorityInput) {
      setAuctionAuthorityInput(wallet.publicKey.toBase58());
    }
  }, [wallet.publicKey, auctionAuthorityInput]);

  const auctionIdBn = useMemo(() => {
    try {
      return new BN(auctionId);
    } catch {
      return null;
    }
  }, [auctionId]);

  const authority = wallet.publicKey ?? null;
  const auctionAuthority = useMemo(() => {
    if (!auctionAuthorityInput.trim()) return authority;
    return parsePubkey(auctionAuthorityInput);
  }, [auctionAuthorityInput, authority]);
  const bidder = wallet.publicKey ?? null;

  const auctionHouse = useMemo(() => {
    if (!auctionAuthority || !auctionIdBn) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('auction'), auctionAuthority.toBuffer(), auctionIdBn.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    )[0];
  }, [auctionAuthority, auctionIdBn]);

  const vault = useMemo(() => {
    if (!auctionHouse) return null;
    return PublicKey.findProgramAddressSync([Buffer.from('vault'), auctionHouse.toBuffer()], PROGRAM_ID)[0];
  }, [auctionHouse]);

  const sealedBid = useMemo(() => {
    if (!auctionHouse || !bidder) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('bid'), auctionHouse.toBuffer(), bidder.toBuffer()],
      PROGRAM_ID
    )[0];
  }, [auctionHouse, bidder]);

  const settleBidderPk = useMemo(() => {
    if (!settleBidder.trim()) return bidder;
    return parsePubkey(settleBidder);
  }, [settleBidder, bidder]);

  const settleSealedBid = useMemo(() => {
    if (!auctionHouse || !settleBidderPk) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('bid'), auctionHouse.toBuffer(), settleBidderPk.toBuffer()],
      PROGRAM_ID
    )[0];
  }, [auctionHouse, settleBidderPk]);

  const bufferSealedBid = useMemo(() => {
    if (!sealedBid) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('buffer'), sealedBid.toBuffer()],
      EPHEMERAL_ROLLUPS_PROGRAM_ID
    )[0];
  }, [sealedBid]);

  const delegationRecordSealedBid = useMemo(() => {
    if (!sealedBid) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('delegation'), sealedBid.toBuffer()],
      DELEGATION_PROGRAM_ID
    )[0];
  }, [sealedBid]);

  const delegationMetadataSealedBid = useMemo(() => {
    if (!sealedBid) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from('delegation-metadata'), sealedBid.toBuffer()],
      DELEGATION_PROGRAM_ID
    )[0];
  }, [sealedBid]);

  const invoke = async (instruction: string, args: unknown[], accounts: Record<string, PublicKey>) => {
    if (!program) throw new Error('Program not ready');

    const methodName = [instruction, toCamel(instruction)].find(
      (name) => typeof (program.methods as any)[name] === 'function'
    );

    if (!methodName) {
      throw new Error(`Method "${instruction}" not found. Available: ${Object.keys(program.methods).join(', ')}`);
    }

    return (await (program.methods as any)[methodName](...args).accounts(accounts).rpc()) as string;
  };

  const withErrorDetails = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e: any) {
      const logs = typeof e?.getLogs === 'function' ? await e.getLogs() : null;
      const details = logs?.length ? `\n${logs.join('\n')}` : '';
      setStatus({ message: `${label} failed: ${e?.message ?? 'unknown error'}${details}` });
    }
  };

  const requireCore = () => {
    if (!program || !authority || !bidder || !auctionHouse || !vault || !sealedBid) {
      setStatus({ message: 'Missing wallet/program/PDAs. Check wallet and inputs.' });
      return false;
    }
    return true;
  };

  const onCreateAuction = async () => {
    if (!requireCore() || !auctionIdBn) return;
    setStatus({ message: 'Creating auction...' });
    await withErrorDetails('create_auction', async () => {
      const tx = await invoke(
        'create_auction',
        [auctionIdBn, new BN(minBid), new BN(minIncrement), new BN(duration)],
        {
          auctionHouse: auctionHouse!,
          vault: vault!,
          authority: authority!,
          systemProgram: SystemProgram.programId,
        }
      );
      setStatus({ message: 'Auction created', tx });
    });
  };

  const onInitializeSealedBid = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Initializing sealed bid...' });
    await withErrorDetails('initialize_sealed_bid', async () => {
      const tx = await invoke('initialize_sealed_bid', [], {
        auctionHouse: auctionHouse!,
        sealedBid: sealedBid!,
        bidder: bidder!,
        systemProgram: SystemProgram.programId,
      });
      setStatus({ message: 'Sealed bid initialized', tx });
    });
  };

  const onSubmitSealedBid = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Submitting sealed bid...' });
    await withErrorDetails('submit_sealed_bid', async () => {
      const tx = await invoke('submit_sealed_bid', [new BN(bidAmount)], {
        auctionHouse: auctionHouse!,
        sealedBid: sealedBid!,
        vault: vault!,
        bidder: bidder!,
        systemProgram: SystemProgram.programId,
      });
      setStatus({ message: 'Bid submitted', tx });
    });
  };

  const onDelegateBid = async () => {
    if (!requireCore() || !bufferSealedBid || !delegationRecordSealedBid || !delegationMetadataSealedBid) return;
    setStatus({ message: 'Delegating bid to PER...' });
    await withErrorDetails('delegate_bid', async () => {
      const tx = await invoke('delegate_bid', [], {
        bufferSealedBid,
        delegationRecordSealedBid,
        delegationMetadataSealedBid,
        sealedBid: sealedBid!,
        bidder: bidder!,
        ownerProgram: PROGRAM_ID,
        delegationProgram: DELEGATION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      });
      setStatus({ message: 'Bid delegated to PER', tx });
    });
  };

  const onProcessUndelegation = async () => {
    if (!requireCore() || !bufferSealedBid) return;
    setStatus({ message: 'Processing undelegation...' });
    await withErrorDetails('process_undelegation', async () => {
      const accountSeeds = [Buffer.from('bid'), auctionHouse!.toBuffer(), bidder!.toBuffer()];
      const tx = await invoke('process_undelegation', [accountSeeds], {
        baseAccount: sealedBid!,
        buffer: bufferSealedBid,
        payer: bidder!,
        systemProgram: SystemProgram.programId,
      });
      setStatus({ message: 'Undelegation processed. You can continue L1 steps.', tx });
    });
  };

  const onCommitBid = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Committing bid...' });
    await withErrorDetails('commit_bid', async () => {
      const methodNames = Object.keys(program!.methods);
      const useL1 = methodNames.includes('commit_bid_l1') || methodNames.includes('commitBidL1');
      const tx = useL1
        ? await invoke('commit_bid_l1', [], {
            auctionHouse: auctionHouse!,
            sealedBid: sealedBid!,
            bidder: bidder!,
          })
        : await invoke('commit_bid', [], {
            auctionHouse: auctionHouse!,
            sealedBid: sealedBid!,
            bidder: bidder!,
            magicProgram: MAGIC_PROGRAM_ID,
            magicContext: MAGIC_CONTEXT_ID,
          });
      setStatus({ message: useL1 ? 'Bid committed (L1 path)' : 'Bid committed', tx });
    });
  };

  const onSettleCommittedBid = async () => {
    if (!program || !auctionHouse || !settleSealedBid) return;
    setStatus({ message: 'Settling committed bid...' });
    await withErrorDetails('settle_committed_bid', async () => {
      const tx = await invoke('settle_committed_bid', [], {
        auctionHouse,
        sealedBid: settleSealedBid,
      });
      setStatus({ message: 'Committed bid settled', tx });
    });
  };

  const onFinalizeAuction = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Finalizing auction...' });
    await withErrorDetails('finalize_auction', async () => {
      const tx = await invoke('finalize_auction', [], {
        auctionHouse: auctionHouse!,
        authority: authority!,
      });
      setStatus({ message: 'Auction finalized', tx });
    });
  };

  const onClaimSellerProceeds = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Claiming seller proceeds...' });
    await withErrorDetails('claim_seller_proceeds', async () => {
      const tx = await invoke('claim_seller_proceeds', [], {
        auctionHouse: auctionHouse!,
        vault: vault!,
        authority: authority!,
      });
      setStatus({ message: 'Seller proceeds claimed', tx });
    });
  };

  const onClaimRefund = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Claiming refund...' });
    await withErrorDetails('claim_refund', async () => {
      const tx = await invoke('claim_refund', [], {
        auctionHouse: auctionHouse!,
        sealedBid: sealedBid!,
        vault: vault!,
        bidder: bidder!,
      });
      setStatus({ message: 'Refund claimed', tx });
    });
  };

  const onCloseSealedBid = async () => {
    if (!requireCore()) return;
    setStatus({ message: 'Closing sealed bid...' });
    await withErrorDetails('close_sealed_bid', async () => {
      const tx = await invoke('close_sealed_bid', [], {
        auctionHouse: auctionHouse!,
        sealedBid: sealedBid!,
        bidder: bidder!,
      });
      setStatus({ message: 'Sealed bid closed', tx });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-6">
          <h1 className="text-3xl font-black tracking-tight text-cyan-300 md:text-4xl">EphemeralBid User Flow</h1>
          <p className="mt-2 text-sm text-slate-200">
            Seller creates auction. Bidder initializes account, places bid, commits. After end time, settle and
            finalize. Seller claims proceeds, losers claim refund.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <WalletMultiButton className="!bg-cyan-600 hover:!bg-cyan-700" />
            <button
              onClick={() => setFlowMode('l1')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                flowMode === 'l1' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              L1 Normal Flow
            </button>
            <button
              onClick={() => setFlowMode('per')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                flowMode === 'per' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              PER Delegate Flow
            </button>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-xs text-slate-300">{status.message}</p>
          {status.tx && <p className="mt-1 break-all text-xs text-emerald-300">TX: {status.tx}</p>}
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/15 bg-slate-900/60 p-6 md:grid-cols-3">
          <label className="text-sm text-slate-200">
            Auction ID
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={auctionId}
              onChange={(e) => setAuctionId(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Auction Authority (seller)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={auctionAuthorityInput}
              onChange={(e) => setAuctionAuthorityInput(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Duration (seconds)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Min Bid (lamports)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={minBid}
              onChange={(e) => setMinBid(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Min Increment (lamports)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={minIncrement}
              onChange={(e) => setMinIncrement(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Bid Amount (lamports)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200 md:col-span-3">
            Settle Bidder Pubkey (optional)
            <input
              className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white"
              value={settleBidder}
              onChange={(e) => setSettleBidder(e.target.value)}
              placeholder="Defaults to connected wallet"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-950/20 p-4">
            <h2 className="text-sm font-bold text-emerald-300">Seller Actions (Wallet A)</h2>
            <div className="mt-3 grid gap-2">
              <button onClick={onCreateAuction} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold">
                1. Create Auction
              </button>
              <button onClick={onFinalizeAuction} className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold">
                6. Finalize Auction
              </button>
              <button
                onClick={onClaimSellerProceeds}
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold"
              >
                7. Claim Seller Proceeds
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-300/20 bg-sky-950/20 p-4">
            <h2 className="text-sm font-bold text-sky-300">Bidder Actions (Wallet B/C)</h2>
            <div className="mt-3 grid gap-2">
              <button
                onClick={onInitializeSealedBid}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold"
              >
                2. Init Sealed Bid
              </button>
              {flowMode === 'l1' && (
                <button
                  onClick={onSubmitSealedBid}
                  className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold"
                >
                  3. Submit Sealed Bid
                </button>
              )}
              {flowMode === 'l1' && (
                <button
                  onClick={onCommitBid}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold"
                >
                  4. Commit Bid (L1)
                </button>
              )}
              {flowMode === 'per' && (
                <button
                  onClick={onDelegateBid}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold"
                >
                  3. Delegate Bid (PER)
                </button>
              )}
              {flowMode === 'per' && (
                <button
                  onClick={onProcessUndelegation}
                  className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-semibold"
                >
                  4. Process Undelegation
                </button>
              )}
              {flowMode === 'per' && (
                <button
                  onClick={onSubmitSealedBid}
                  className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold"
                >
                  5. Submit Sealed Bid (after undelegation)
                </button>
              )}
              {flowMode === 'per' && (
                <button
                  onClick={onCommitBid}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold"
                >
                  6. Commit Bid (L1)
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-300/20 bg-orange-950/20 p-4">
            <h2 className="text-sm font-bold text-orange-300">Settlement</h2>
            <div className="mt-3 grid gap-2">
              <button
                onClick={onSettleCommittedBid}
                className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-semibold"
              >
                5. Settle Committed Bid
              </button>
              <button onClick={onClaimRefund} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold">
                8. Claim Refund (loser)
              </button>
              <button onClick={onCloseSealedBid} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold">
                9. Close Sealed Bid
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4 text-xs text-slate-300">
          <p>Connected Wallet: {authority?.toBase58() ?? 'N/A'}</p>
          <p>Auction Authority: {auctionAuthority?.toBase58() ?? 'N/A'}</p>
          <p>Auction PDA: {auctionHouse?.toBase58() ?? 'N/A'}</p>
          <p>Vault PDA: {vault?.toBase58() ?? 'N/A'}</p>
          <p>SealedBid PDA: {sealedBid?.toBase58() ?? 'N/A'}</p>
          <p>Settle SealedBid PDA: {settleSealedBid?.toBase58() ?? 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
