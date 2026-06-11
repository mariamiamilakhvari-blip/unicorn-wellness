'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Image from 'next/image'

const QUESTION_LABELS: Record<string, string> = {
  genderIdentity: 'Gender Identity',
  ageCohort: 'Age Group',
  nationality: 'Nationality',
  maritalStatus: 'Relationship Status',
  relaxationTriggers: 'Relaxation Triggers',
  fatigueState: 'Post-Work Feeling',
  microDesire: 'Current Micro-Desire',
  environmentalComfort: 'Ideal Environment',
  primaryMotivators: 'Primary Motivators',
  stressCoping: 'Stress Coping',
  contentFilters: 'Content Interests',
  focalPriority: 'Core Focus',
  productivityWindows: 'Productivity Windows',
  targetIntervention: 'Target Intervention',
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Record<string, string | string[]>>({})
  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login'); return }
    try { setProfile(JSON.parse(localStorage.getItem('unicorn_profile') || '{}')) } catch {}
    setAvatar(localStorage.getItem('unicorn_avatar'))
  }, [status, router])

  function signOut() {
    nextAuthSignOut({ callbackUrl: '/login' })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) {
        setAvatar(data.url)
        localStorage.setItem('unicorn_avatar', data.url)
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const profileEntries = Object.entries(QUESTION_LABELS).filter(([key]) => profile[key] !== undefined)

  return (
    <div className="-mx-6 -my-8 min-h-screen bg-[#EBF5FB] px-6 py-8">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('profileTitle')}</h1>
        </div>

        {/* Account card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t('profileAccount')}</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-velvet-400 to-velvet-600 flex items-center justify-center group"
            >
              {avatar ? (
                <Image src={avatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div>
              <p className="text-xl font-bold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              <p className="text-xs text-sage-600 font-semibold mt-1">{t('profileFreeTrial')}</p>
            </div>
          </div>
        </div>

        {/* Wellness profile */}
        {profileEntries.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t('profileWellBeing')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {profileEntries.map(([key, label]) => {
                const val = profile[key]
                const display = Array.isArray(val) ? val.join(', ') : val
                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{display || '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex">
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            {t('profileSignOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
