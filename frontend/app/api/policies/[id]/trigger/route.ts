import { NextRequest, NextResponse } from "next/server"

const VERDICTS = ["YES", "NO", "UNDECIDED"]
let verdictIndex = 0

const policies: Record<number, any> = {}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const policy = policies[Number(id)]

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 })
  }

  if (policy.status !== 0) {
    return NextResponse.json({ error: "Policy is not active" }, { status: 400 })
  }

  // Cycle through verdicts for demo purposes
  const verdict = VERDICTS[verdictIndex % VERDICTS.length]
  verdictIndex++

  if (verdict === "YES") {
    policy.status = 2
  } else {
    policy.status = 5 // DISPUTED — eligible for Internet Court appeal
  }
  policies[Number(id)] = policy

  return NextResponse.json({ verdict })
}
