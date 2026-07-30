/**
 * Brevita deployment script for GenLayer.
 *
 * Usage:
 *   genlayer deploy
 *
 * Ensure your GenLayer CLI is configured with the target network:
 *   genlayer network studio (for local Studio)
 *   genlayer network testnet (for GenLayer testnet)
 */

import { createClient, createAccount } from "@genlayer/js"
import { readFileSync } from "fs"
import { join } from "path"

const CONTRACT_PATH = join(__dirname, "..", "contracts", "brevita (1).py")

async function main() {
  console.log("Deploying Brevita...")

  const client = await createClient({
    network: (process.env.GENLAYER_NETWORK as any) ?? "studio",
    studioUrl: process.env.GENLAYER_STUDIO_URL ?? "http://localhost:8000",
  })

  const account = createAccount()

  const sourceCode = readFileSync(CONTRACT_PATH, "utf-8")

  const txHash = await client.deployContract({
    account,
    source: sourceCode,
    contractName: "Brevita",
  })

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: "finalized",
  })

  console.log("Contract deployed at:", receipt.contractAddress)
  console.log("Transaction:", txHash)
  console.log("\nSet this in your frontend .env:")
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${receipt.contractAddress}`)
}

main().catch((err) => {
  console.error("Deployment failed:", err)
  process.exit(1)
})
