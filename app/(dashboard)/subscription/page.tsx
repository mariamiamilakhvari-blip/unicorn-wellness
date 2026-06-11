'use client'
import { useState } from 'react'
import { Check, Loader2, Crown, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function SubscriptionPage() {
  const { t } = useLanguage()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const TRIAL_DAYS = 21
  const savings = Math.round(((4.99 * 12 - 59.99) / (4.99 * 12)) * 100)

  const FEATURES = [
    { icon: '🌀', text: t('subPremiumFeature1') },
    { icon: '🎯', text: t('subPremiumFeature2') },
    { icon: '⚡', text: t('subPremiumFeature3') },
    { icon: '⌚', text: t('subPremiumFeature4') },
    { icon: '🧠', text: t('subPremiumFeature5') },
    { icon: '🔔', text: t('subPremiumFeature6') },
    { icon: '📊', text: t('subPremiumFeature7') },
    { icon: '🫂', text: t('subPremiumFeature8') },
  ]

  async function subscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/dodo/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('subTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('subSubtitle')}</p>
      </div>

      {/* Trial banner */}
      <div className="bg-gradient-to-r from-ochre-400 to-velvet-600 rounded-2xl p-5 text-white flex items-center gap-4 max-w-2xl mx-auto">
        <div className="bg-white/20 p-3 rounded-xl shrink-0">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold">{t('subTrialActive')} — {TRIAL_DAYS} days remaining</p>
          <p className="text-sm opacity-90 mt-0.5">{t('subTrialNote')}</p>
        </div>
      </div>

      {/* Plan toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-xl p-1 flex gap-1 w-64">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${plan === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-muted-foreground'}`}
          >
            {t('subMonthly')}
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${plan === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-muted-foreground'}`}
          >
            {t('subYearly')}
            <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded-full bg-sage-500 text-white text-[9px] font-bold">
              -{savings}%
            </span>
          </button>
        </div>
      </div>

      {/* Side-by-side plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
          <div className="mb-6">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('subFreeTrial')}</span>
            <div className="mt-2">
              <span className="text-4xl font-black text-gray-900">{t('subFreePrice')}</span>
              <span className="text-muted-foreground ml-1">{t('subFreeDays')}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t('subFreeNoCard')}</p>
          </div>
          <div className="space-y-3 mb-8">
            {[t('subFreeFeature1'), t('subFreeFeature2'), t('subFreeFeature3'), t('subFreeFeature4')].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-gray-500" />
                </div>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
          <div className="h-11 flex items-center justify-center rounded-xl border border-border text-sm font-semibold text-muted-foreground bg-gray-50">
            {t('subCurrentPlan')}
          </div>
        </div>

        {/* Premium card */}
        <div className="bg-gradient-to-br from-velvet-500 to-velvet-700 rounded-2xl p-8 text-white shadow-xl shadow-ochre-100 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Crown className="h-8 w-8 text-white/30" />
          </div>
          <div className="mb-6">
            <span className="text-sm font-semibold text-ochre-100 uppercase tracking-wide">{t('subPremium')}</span>
            <div className="mt-2">
              <span className="text-4xl font-black">
                {plan === 'yearly' ? '$59.99' : '$4.99'}
              </span>
              <span className="text-ochre-100 ml-1">/ {plan === 'yearly' ? t('subYear') : t('subMonth')}</span>
            </div>
            {plan === 'yearly'
              ? <p className="text-sage-300 text-sm font-semibold mt-1">{t('subYearlyNote')} ${(4.99 * 12 - 59.99).toFixed(2)}</p>
              : <p className="text-ochre-100 text-sm mt-1">{t('subMonthlyNote')}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-2">
                <span className="text-sm shrink-0">{f.icon}</span>
                <span className="text-xs text-ochre-100 leading-tight">{f.text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={subscribe}
            disabled={loading}
            className="w-full h-12 bg-white text-velvet-600 hover:bg-ochre-50 font-bold rounded-xl text-base shadow-lg"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
            {t('subStartAfterTrial')} · {plan === 'yearly' ? '$59.99/yr' : '$4.99/mo'}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t('subSecure')}
      </p>
    </div>
  )
}
