import { NextResponse } from "next/server"

const policies: any[] = []
let nextId = 1

export async function GET() {
  return NextResponse.json(policies)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const policy = {
      id: nextId++,
      holder: "0x0000000000000000000000000000000000000000",
      event_type: body.event_type,
      location: body.location,
      trigger_condition: body.trigger_condition,
      data_sources: body.data_sources ?? [],
      payout: body.payout,
      premium: Math.floor(body.payout * 0.2),
      status: 0,
      created_at: Math.floor(Date.now() / 1000),
      expires_at: Math.floor(Date.now() / 1000) + (body.expires_after_days ?? 90) * 86400,
    }

    policies.push(policy)

    return NextResponse.json({ policyId: policy.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    )
  }
}
