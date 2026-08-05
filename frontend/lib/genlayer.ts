const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ""

let activeAccount: string | null = null
let cachedClient: any = null
let cachedWriteClient: any = null

export function setActiveAccount(address: string | null) {
  activeAccount = address
  cachedWriteClient = null
}

async function getClient() {
  if (cachedClient) return cachedClient
  const { createClient } = await import("genlayer-js")
  const { studionet } = await import("genlayer-js/chains")

  // studionet's built-in endpoint already points at the hosted Studio
  // backend. Don't override it unless you're running Studio locally via
  // `genlayer up`, in which case pass endpoint: 'http://localhost:4000/api'.
  cachedClient = createClient({
    chain: studionet,
  })
  return cachedClient
}

export async function readContract(
  functionName: string,
  args: any[] = [],
  address: string = CONTRACT_ADDRESS
) {
  const client = await getClient()
  return client.readContract({
    address: address as `0x${string}`,
    functionName,
    args,
  }) as any
}

export async function writeContract(
  functionName: string,
  args: any[] = [],
  value: number = 0,
  address: string = CONTRACT_ADDRESS
) {
  if (!activeAccount) {
    throw new Error("No wallet connected. Connect your wallet before submitting a transaction.")
  }

  const client = await getWriteClient()
  const { TransactionStatus } = await import("genlayer-js/types")

  const txHash = await (client as any).writeContract({
    address: address as `0x${string}`,
    functionName,
    args,
    value: BigInt(value),
  })

  const receipt: any = await (client as any).waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 100,
    interval: 5000,
  })

  assertTransactionSucceeded(receipt, functionName)
  return receipt
}

/**
 * ACCEPTED/FINALIZED only mean validators reached consensus on an outcome -
 * that outcome can be a revert. The actual success/failure lives in
 * leader_receipt.execution_result ("SUCCESS" vs an error code) and
 * leader_receipt.error. Without this check, a reverted transaction (e.g. a
 * failed assertion) looks identical to a successful one to calling code.
 */
function assertTransactionSucceeded(receipt: any, functionName: string) {
  const receiptEntries = receipt?.consensus_data?.leader_receipt
  const leaderEntry = Array.isArray(receiptEntries)
    ? receiptEntries.find((e: any) => e?.mode === "leader") ?? receiptEntries[0]
    : receiptEntries

  const executionResult = leaderEntry?.execution_result
  const genvmResult = leaderEntry?.genvm_result

  const errorMessage =
    genvmResult?.error_description ??
    genvmResult?.error ??
    genvmResult?.message ??
    genvmResult?.stderr ??
    leaderEntry?.error ??
    receipt?.error

  if (executionResult && executionResult !== "SUCCESS") {
    throw new Error(
      `${functionName} failed on-chain (${executionResult})${errorMessage ? `: ${errorMessage}` : ""}`
    )
  }

  if (errorMessage) {
    throw new Error(`${functionName} failed on-chain: ${errorMessage}`)
  }
}

async function getWriteClient() {
  if (cachedWriteClient) return cachedWriteClient
  if (!activeAccount) {
    throw new Error("No wallet connected. Connect your wallet before submitting a transaction.")
  }
  const { createClient } = await import("genlayer-js")
  const { studionet } = await import("genlayer-js/chains")

  const provider =
    typeof window !== "undefined" ? (window as any).ethereum : undefined

  cachedWriteClient = createClient({
    chain: studionet,
    account: activeAccount as `0x${string}`,
    ...(provider ? { provider } : {}),
  })
  return cachedWriteClient
}
