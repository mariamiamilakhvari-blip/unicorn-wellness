'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Trash2, Pencil, Check, X, Search, RefreshCw,
  UserCheck, UserX, Crown, Mail, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type User = {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  provider: string
  onboardingCompleted: boolean
  subscription?: { plan: string; status: string }
  createdAt: string
  image?: string
}

type EditingUser = { name: string; email: string; role: 'user' | 'admin' }

const PLAN_COLORS: Record<string, string> = {
  free_trial: 'bg-gray-700 text-gray-300',
  monthly: 'bg-blue-900/50 text-blue-300',
  yearly: 'bg-velvet-900/50 text-velvet-300',
  premium: 'bg-amber-900/50 text-amber-300',
  none: 'bg-gray-800 text-gray-500',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditingUser>({ name: '', email: '', role: 'user' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(user: User) {
    setEditingId(user._id)
    setEditForm({ name: user.name, email: user.email, role: user.role })
  }

  async function saveUser() {
    if (!editingId) return
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...editForm }),
    })
    const data = await res.json()
    if (data.user) setUsers(prev => prev.map(u => u._id === editingId ? { ...u, ...data.user } : u))
    setEditingId(null)
    setSaving(false)
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setUsers(prev => prev.filter(u => u._id !== id))
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    onboarded: users.filter(u => u.onboardingCompleted).length,
    premium: users.filter(u => u.subscription?.plan && u.subscription.plan !== 'free_trial' && u.subscription.plan !== 'none').length,
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered accounts</p>
        </div>
        <Button size="sm" variant="outline" onClick={load} className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: '👥' },
          { label: 'Admins', value: stats.admins, icon: '🛡️' },
          { label: 'Onboarded', value: stats.onboarded, icon: '✅' },
          { label: 'Premium', value: stats.premium, icon: '👑' },
        ].map(s => (
          <Card key={s.label} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-velvet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Onboarding</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} className="border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-3">
                      {editingId === user._id ? (
                        <div className="flex flex-col gap-1.5">
                          <Input
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Name"
                            className="bg-gray-800 border-gray-600 text-white text-xs h-7 w-40"
                          />
                          <Input
                            value={editForm.email}
                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="Email"
                            className="bg-gray-800 border-gray-600 text-white text-xs h-7 w-40"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-velvet-400 to-velvet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white text-sm">{user.name}</p>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user._id ? (
                        <select
                          className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white"
                          value={editForm.role}
                          onChange={e => setEditForm(f => ({ ...f, role: e.target.value as 'user' | 'admin' }))}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.role === 'admin' ? 'bg-velvet-900/50 text-velvet-300' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {user.role === 'admin' && <Crown className="h-2.5 w-2.5 inline mr-1" />}
                          {user.role ?? 'user'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">{user.provider}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[user.subscription?.plan ?? 'none'] ?? 'bg-gray-800 text-gray-500'}`}>
                        {user.subscription?.plan ?? 'none'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.onboardingCompleted
                        ? <UserCheck className="h-4 w-4 text-green-500" />
                        : <UserX className="h-4 w-4 text-gray-600" />}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === user._id ? (
                          <>
                            <button onClick={saveUser} disabled={saving}
                              className="p-1.5 rounded-lg hover:bg-green-900/30 text-gray-500 hover:text-green-400 transition-colors">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(user)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-200 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteUser(user._id)}
                              className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      {search ? `No users matching "${search}"` : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
