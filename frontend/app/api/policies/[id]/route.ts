import { NextRequest, NextResponse } from "next/server"

const policies: Record<number, any> = {}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const policy = policies[Number(id)]

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 })
  }

  return NextResponse.json(policy)
}
