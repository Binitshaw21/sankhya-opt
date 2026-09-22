import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth, USER_ROLES, type UserRole } from '@/context/AuthContext'
import { SankhyaMark } from '@/components/shared/Mark'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, hardwareTokenLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Plant Operator')
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try { await signIn({ username, employeeId, password, role }); navigate('/app/command-center') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Local authentication failed.') }
  }

  const tokenLogin = async () => {
    try {
      await hardwareTokenLogin(role)
      navigate('/app/command-center')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Local hardware token could not be read.')
    }
  }

  return <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8"><div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-line bg-canvas shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
    <div className="hidden bg-ink p-10 text-white dark:bg-slate-950 lg:flex lg:flex-col lg:justify-between"><div><SankhyaMark className="h-10 w-10" /><p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sovereign access plane</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Local identity for critical optimization.</h1><p className="mt-4 text-sm leading-6 text-slate-300">Role-scoped access to dispatch, telemetry, economics, and certification surfaces. No external identity provider is contacted.</p></div><div className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Air-gapped session · auto-expires in 30 minutes</div></div>
    <div className="p-6 sm:p-10"><div className="flex items-center gap-2 lg:hidden"><SankhyaMark className="h-8 w-8" /><span className="text-sm font-semibold">SANKHYA-OPT</span></div><div className="mt-6 lg:mt-0"><p className="label-caps">Enterprise console</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Sign in locally</h2><p className="mt-1 text-sm text-ink-secondary">Use a provisioned employee identity or the attached hardware token.</p></div>
      <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-xs font-semibold text-ink-secondary">Enterprise username<input required value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink dark:bg-surface-2" /></label><label className="block text-xs font-semibold text-ink-secondary">Employee ID<input required value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-canvas px-3 font-mono text-sm text-ink dark:bg-surface-2" /></label><label className="block text-xs font-semibold text-ink-secondary">Local passphrase<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink dark:bg-surface-2" /></label><label className="block text-xs font-semibold text-ink-secondary">Role<select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-1.5 h-10 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink dark:bg-surface-2">{USER_ROLES.map((item) => <option key={item}>{item}</option>)}</select></label>{error ? <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p> : null}<button type="submit" className="h-10 w-full rounded-md bg-ink text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"><LockKeyhole className="mr-2 inline h-4 w-4" />Sign in to local console</button></form>
      <button type="button" onClick={() => void tokenLogin()} className="mt-3 h-10 w-full rounded-md border border-line text-sm font-semibold text-ink-secondary hover:bg-surface"><KeyRound className="mr-2 inline h-4 w-4" />Use air-gapped hardware token</button><p className="mt-6 text-center text-xs text-ink-muted">New local identity? <Link to="/signup" className="font-semibold text-brand hover:underline">Create operator profile</Link></p>
    </div></div></div>
}
