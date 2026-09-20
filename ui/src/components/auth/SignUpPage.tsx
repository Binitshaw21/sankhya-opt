import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useAuth, USER_ROLES, type UserRole } from '@/context/AuthContext'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ username: '', employeeId: '', password: '', role: 'Plant Operator' as UserRole })
  const [error, setError] = useState('')
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try { await signUp(form); navigate('/app/command-center') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create local identity.') }
  }
  return <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8"><div className="w-full max-w-xl rounded-lg border border-line bg-canvas p-6 shadow-xl sm:p-10"><Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" />Back to sign in</Link><p className="label-caps mt-9">Air-gapped provisioning</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Create local operator profile</h1><p className="mt-1 text-sm leading-6 text-ink-secondary">The profile is stored locally for this workstation. It does not contact a cloud identity provider.</p><form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-ink-secondary">Enterprise username<input required value={form.username} onChange={(event) => update('username', event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line px-3 text-sm text-ink" /></label><label className="text-xs font-semibold text-ink-secondary">Employee ID<input required value={form.employeeId} onChange={(event) => update('employeeId', event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line px-3 font-mono text-sm text-ink" /></label><label className="text-xs font-semibold text-ink-secondary sm:col-span-2">Password<input required minLength={8} type="password" value={form.password} onChange={(event) => update('password', event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line px-3 text-sm text-ink" /></label><label className="text-xs font-semibold text-ink-secondary sm:col-span-2">Role<select value={form.role} onChange={(event) => update('role', event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink">{USER_ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>{error ? <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger sm:col-span-2">{error}</p> : null}<button type="submit" className="h-10 rounded-md bg-ink text-sm font-semibold text-white sm:col-span-2"><UserPlus className="mr-2 inline h-4 w-4" />Provision local profile</button></form></div></div>
}
