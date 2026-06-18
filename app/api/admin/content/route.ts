import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import PageContent from '@/lib/models/PageContent'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  if (session.user.role !== 'admin') return null
  return session
}

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get('page')
  await connectDB()
  const query = page ? { page } : {}
  const docs = await PageContent.find(query).lean()
  return NextResponse.json({ content: docs })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { page, key, value } = await req.json()
  if (!page || !key || value === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await connectDB()
  const doc = await PageContent.findOneAndUpdate(
    { page, key },
    { page, key, value },
    { upsert: true, new: true }
  )
  return NextResponse.json({ content: doc })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await connectDB()
  await PageContent.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
