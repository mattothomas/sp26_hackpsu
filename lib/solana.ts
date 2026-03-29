import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import type { WalletContextState } from '@solana/wallet-adapter-react'
import { FRIEND_WALLET_ADDRESS, STAKE_LAMPORTS } from '@/constants'

const DEVNET_RPC = 'https://api.devnet.solana.com'

/**
 * Transfers STAKE_LAMPORTS from the connected wallet to FRIEND_WALLET_ADDRESS.
 * Returns the transaction signature (may still be confirming when returned).
 * Throws if the wallet is not connected or the user rejects the transaction.
 * Caller should fall back to FAKE_TX_HASH if this throws.
 */
export async function slashStake(wallet: WalletContextState): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected')
  }

  const connection = new Connection(DEVNET_RPC, 'confirmed')
  const toPublicKey = new PublicKey(FRIEND_WALLET_ADDRESS)

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: toPublicKey,
      lamports: STAKE_LAMPORTS,
    })
  )

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = wallet.publicKey

  // 15s timeout — if it times out we still return the sig since it may confirm
  const sigPromise = wallet.sendTransaction(tx, connection)
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Solana RPC timeout')), 15_000)
  )

  const sig = await Promise.race([sigPromise, timeoutPromise])
  return sig
}
