import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

export async function POST(req: Request) {
  const body = await req.text()
  const headers = {
    'webhook-id': req.headers.get('webhook-id') ?? '',
    'webhook-signature': req.headers.get('webhook-signature') ?? '',
    'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
  }

  let event
  try {
    event = dodo.webhooks.unwrap(body, { headers, key: process.env.DODO_WEBHOOK_KEY })
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  await connectDB()

  if (event.type === 'subscription.active' || event.type === 'subscription.renewed') {
    const sub = event.data
    const userId = sub.metadata?.userId
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        'subscription.plan': 'premium',
        'subscription.status': 'active',
        'subscription.dodoCustomerId': sub.customer.customer_id,
        'subscription.dodoSubscriptionId': sub.subscription_id,
      })
    }
  }

  if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired') {
    const sub = event.data
    const userId = sub.metadata?.userId
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        'subscription.plan': 'none',
        'subscription.status': event.type === 'subscription.cancelled' ? 'cancelled' : 'expired',
      })
    }
  }

  return NextResponse.json({ received: true })
}
