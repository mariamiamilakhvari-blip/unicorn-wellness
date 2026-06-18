import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { plan }: { plan?: 'monthly' | 'yearly' } = await req.json().catch(() => ({}))

    const productId = plan === 'monthly'
      ? process.env.DODO_MONTHLY_PRODUCT_ID || process.env.DODO_PREMIUM_PRODUCT_ID!
      : plan === 'yearly'
        ? process.env.DODO_YEARLY_PRODUCT_ID || process.env.DODO_PREMIUM_PRODUCT_ID!
        : process.env.DODO_PREMIUM_PRODUCT_ID!

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const checkout = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      metadata: { userId: String(session.user.id), plan: plan ?? 'premium' },
      customization: {
        theme: 'light',
        theme_config: {
          light: {
            bg_primary: '#EBF5FB',
            bg_secondary: '#EBF5FB',
          },
        },
      },
    })

    return NextResponse.json({ url: checkout.checkout_url })
  } catch (err) {
    console.error('Dodo checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
