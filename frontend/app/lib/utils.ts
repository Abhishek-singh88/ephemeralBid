import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

let cachedProvider: AnchorProvider | null = null;

export function getProvider(): AnchorProvider | null {
  return cachedProvider;
}

export function setProvider(provider: AnchorProvider) {
  cachedProvider = provider;
}

export function getAuctionPDA(authority: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('auction'), authority.toBuffer()],
    new PublicKey('HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE')
  )[0];
}
