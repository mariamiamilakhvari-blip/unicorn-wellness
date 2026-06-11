import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const checkout = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: process.env.DODO_PREMIUM_PRODUCT_ID!, quantity: 1 }],
      customer: { email: user.email },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      metadata: { userId: String(session.user.id) },
    })

    return NextResponse.json({ url: checkout.checkout_url })
  } catch (err) {
    console.error('Dodo checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
