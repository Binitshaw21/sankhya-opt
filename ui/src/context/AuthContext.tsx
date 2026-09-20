/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const USER_ROLES = [
  'Plant Operator',
  'Optimization Scientist',
  'Refinery Economist',
  'Compliance Auditor',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface AuthUser {
  username: string
  employeeId: string
  role: UserRole
  signedInAt: string
  expiresAt: string
}

interface AuthContextValue {
  user: AuthUser | null
  signIn: (credentials: { username: string; employeeId: string; password: string; role: UserRole }) => Promise<void>
  signUp: (credentials: { username: string; employeeId: string; password: string; role: UserRole }) => Promise<void>
  hardwareTokenLogin: (role: UserRole) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const SESSION_KEY = 'sankhya-encrypted-session'
const DEVICE_KEY = 'sankhya-local-device-key'
const SESSION_TTL_MS = 30 * 60 * 1000

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

function base64ToBuffer(value: string): ArrayBuffer {
  return base64ToBytes(value).buffer as ArrayBuffer
}

async function getDeviceKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(DEVICE_KEY)
  if (stored) return crypto.subtle.importKey('raw', base64ToBuffer(stored), 'AES-GCM', false, ['encrypt', 'decrypt'])
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(DEVICE_KEY, bytesToBase64(new Uint8Array(raw)))
  return key
}

async function encryptSession(user: AuthUser): Promise<string> {
  const key = await getDeviceKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const payload = new TextEncoder().encode(JSON.stringify(user))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload)
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`
}

async function decryptSession(value: string): Promise<AuthUser | null> {
  try {
    const [ivValue, encryptedValue] = value.split('.')
    const key = await getDeviceKey()
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBuffer(ivValue) }, key, base64ToBuffer(encryptedValue))
    return JSON.parse(new TextDecoder().decode(decrypted)) as AuthUser
  } catch {
    return null
  }
}

function createUser(username: string, employeeId: string, role: UserRole): AuthUser {
  const signedInAt = new Date().toISOString()
  return { username, employeeId, role, signedInAt, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return
    void decryptSession(stored).then((session) => {
      if (session && new Date(session.expiresAt).getTime() > Date.now()) setUser(session)
      else localStorage.removeItem(SESSION_KEY)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const remaining = new Date(user.expiresAt).getTime() - Date.now()
    const timeout = window.setTimeout(() => {
      localStorage.removeItem(SESSION_KEY)
      setUser(null)
    }, Math.max(remaining, 0))
    return () => window.clearTimeout(timeout)
  }, [user])

  const authenticate = useCallback(async (username: string, employeeId: string, password: string, role: UserRole) => {
    if (!username.trim() || !employeeId.trim() || password.length < 8) throw new Error('Use an employee ID, username, and an 8-character local passphrase.')
    const nextUser = createUser(username.trim(), employeeId.trim(), role)
    localStorage.setItem(SESSION_KEY, await encryptSession(nextUser))
    setUser(nextUser)
  }, [])

  const signIn = useCallback(async (credentials: { username: string; employeeId: string; password: string; role: UserRole }) => {
    await authenticate(credentials.username, credentials.employeeId, credentials.password, credentials.role)
  }, [authenticate])

  const signUp = useCallback(async (credentials: { username: string; employeeId: string; password: string; role: UserRole }) => {
    await authenticate(credentials.username, credentials.employeeId, credentials.password, credentials.role)
  }, [authenticate])

  const hardwareTokenLogin = useCallback(async (role: UserRole) => {
    const tokenUser = createUser('local-hardware-operator', 'TOKEN-LOCAL-01', role)
    localStorage.setItem(SESSION_KEY, await encryptSession(tokenUser))
    setUser(tokenUser)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signUp, hardwareTokenLogin, signOut }), [hardwareTokenLogin, signIn, signOut, signUp, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
