'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🥷 EphemeralBid
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/auction"
              className="px-6 py-2 text-white/80 hover:text-white font-medium transition-all rounded-full hover:bg-white/10"
            >
              Auctions
            </Link>
            <WalletMultiButton 
              className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !text-white"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text mb-8 leading-tight">
            Private Sealed-Bid 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Auctions</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Bids execute privately in <strong>MagicBlock PER</strong> rollups. 
            No sniping. Fair reveals. Winner takes all.
          </p>

          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/auction">
              <div className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                🏪 Browse Auctions
              </div>
            </Link>
            
            {connected && (
              <Link href="/auction/new" className="px-12 py-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-white text-xl hover:bg-white/20 transition-all">
                ➕ Create Auction
              </Link>
            )}
          </div>

          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-emerald-300 text-sm font-semibold">
              Solana Blitz v0 • MagicBlock PER Hackathon
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 max-w-6xl mx-auto mb-32">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-10 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              🥷
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Private Bids</h3>
            <p className="text-white/70 leading-relaxed">
              Bids execute in MagicBlock Private Ephemeral Rollups. 
              No one sees your amount until auction end.
            </p>
          </div>

          <div className="group p-10 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Real-Time</h3>
            <p className="text-white/70 leading-relaxed">
              Sub-second bid execution. State syncs back to Solana L1 
              automatically after private processing.
            </p>
          </div>

          <div className="group p-10 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Fair Reveals</h3>
            <p className="text-white/70 leading-relaxed">
              All bids revealed simultaneously at auction end. 
              Winner auto-settles. Losers get instant refunds.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 max-w-6xl mx-auto mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 bg-white/3 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
          <div>
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              48h
            </div>
            <div className="text-white/60 mt-2 font-mono text-sm">Hackathon</div>
          </div>
          <div>
            <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              PER
            </div>
            <div className="text-white/60 mt-2 font-mono text-sm">Privacy</div>
          </div>
          <div>
            <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Solana
            </div>
            <div className="text-white/60 mt-2 font-mono text-sm">Devnet</div>
          </div>
          <div>
            <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              $1K
            </div>
            <div className="text-white/60 mt-2 font-mono text-sm">Prizes</div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 pb-16 max-w-4xl mx-auto text-center">
        <Link 
          href="/auction"
          className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-16 py-8 rounded-3xl font-bold text-2xl shadow-2xl hover:scale-105 transition-all duration-300 mb-8"
        >
          🚀 Launch EphemeralBid
        </Link>
        <p className="text-white/50 text-lg">
          Powered by Anchor + MagicBlock PER + Next.js 14
        </p>
      </div>
    </main>
  );
}
