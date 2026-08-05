import { readContract, writeContract } from "./genlayer"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

function toPolicy(raw: Record<string, JsonValue>) {
  return {
    id: Number(raw.id ?? 0),
    holder: String(raw.holder ?? ""),
    event_type: String(raw.event_type ?? ""),
    location: String(raw.location ?? ""),
    trigger_condition: String(raw.trigger_condition ?? ""),
    data_sources: parseDataSources(raw.data_sources),
    payout: Number(raw.payout ?? 0),
    premium: Number(raw.premium ?? 0),
    status: Number(raw.status ?? 0),
    created_at: Number(raw.created_at ?? 0),
    expires_at: Number(raw.expires_at ?? 0),
  }
}

function parseDataSources(value: JsonValue | undefined): string[] {
  // The contract stores this as a single newline-joined string
  // (Policy.data_sources: str), not an array - split it back out.
  if (typeof value === "string") {
    return value.split("\n").map((s) => s.trim()).filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.map(String)
  }
  return []
}

export async function createPolicy(params: {
  event_type: string
  location: string
  trigger_condition: string
  data_sources: string[]
  payout: number
  expires_after_days: number
}) {
  const receipt = await writeContract(
    "create_policy",
    [
      params.event_type,
      params.location,
      params.trigger_condition,
      params.data_sources,
      params.payout,
      params.expires_after_days,
    ],
    params.payout + Math.floor(params.payout * 0.2)
  )
  return receipt
}

const STATUS_ACTIVE = 0
const STATUS_TRIGGERED = 1
const STATUS_PAID_OUT = 2
const STATUS_EXPIRED = 3
const STATUS_CANCELLED = 4
const STATUS_DISPUTED = 5

function verdictFromStatus(status: number, resolved: string, denied: string) {
  if (status === STATUS_PAID_OUT) return resolved
  if (status === STATUS_DISPUTED || status === STATUS_EXPIRED) return denied
  return null
}

export interface TriggerResult {
  receipt: unknown
  verdict: string | null
  policy: ReturnType<typeof toPolicy> | null
}

export async function checkAndTrigger(policyId: number): Promise<TriggerResult> {
  const receipt = await writeContract("check_and_trigger", [policyId])
  const policy = await getPolicy(policyId)
  return {
    receipt,
    verdict: policy ? verdictFromStatus(policy.status, "YES", "NO") : null,
    policy,
  }
}

export async function resolveDisputeOnChain(policyId: number): Promise<TriggerResult> {
  const receipt = await writeContract("resolve_dispute", [policyId])
  const policy = await getPolicy(policyId)
  return {
    receipt,
    verdict: policy ? verdictFromStatus(policy.status, "TRUE", "FALSE") : null,
    policy,
  }
}

export async function cancelPolicy(policyId: number) {
  const receipt = await writeContract("cancel_policy", [policyId])
  return receipt
}

export async function getPolicy(policyId: number) {
  const raw = (await readContract("get_policy", [policyId])) as Record<
    string,
    JsonValue
  > | null
  return raw ? toPolicy(raw) : null
}

export async function getPoliciesByHolder(holder: string) {
  const raw = (await readContract("get_policies_by_holder", [holder])) as
    | Record<string, JsonValue>[]
    | null
  return (raw ?? []).map(toPolicy)
}

export async function getPolicyCount() {
  const raw = await readContract("get_policy_count", [])
  return Number(raw ?? 0)
}

export async function withdrawRevenue(amount: number) {
  const receipt = await writeContract("withdraw_revenue", [amount])
  return receipt
}

export async function getAccumulatedRevenue() {
  const raw = await readContract("get_accumulated_revenue", [])
  return Number(raw ?? 0)
}
