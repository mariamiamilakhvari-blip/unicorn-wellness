import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

// Fallback path for local dev / immediate UI feedback where the Dodo webhook
// can't reach localhost. Confirms subscription status directly with Dodo's
// API instead of waiting on the webhook, then syncs the user record.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subscriptionId }: { subscriptionId?: string } = await req.json()
    if (!subscriptionId) return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 })

    const sub = await dodo.subscriptions.retrieve(subscriptionId)
    if (sub.metadata?.userId !== String(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    if (sub.status === 'active') {
      await User.findByIdAndUpdate(session.user.id, {
        'subscription.plan': 'premium',
        'subscription.status': 'active',
        'subscription.dodoCustomerId': sub.customer.customer_id,
        'subscription.dodoSubscriptionId': sub.subscription_id,
      })
    }

    return NextResponse.json({ status: sub.status })
  } catch (err) {
    console.error('Dodo verify error:', err)
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 })
  }
}
