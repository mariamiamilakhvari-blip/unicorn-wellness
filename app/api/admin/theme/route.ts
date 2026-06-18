import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import SiteConfig from '@/lib/models/SiteConfig'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  if (session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  await connectDB()
  const configs = await SiteConfig.find({}).lean()
  const result: Record<string, string> = {}
  for (const c of configs) result[c.key] = c.value
  return NextResponse.json({ config: result })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { updates } = await req.json() as { updates: Record<string, string> }
  if (!updates || typeof updates !== 'object') return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  await connectDB()
  const ops = Object.entries(updates).map(([key, value]) =>
    SiteConfig.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
  )
  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
