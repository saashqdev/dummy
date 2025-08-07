'server-only'

import { parse, serialize } from 'cookie'
import { cookies } from 'next/headers'
import { defaultThemeColor, defaultThemeScheme } from '../themes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redirect } from 'next/navigation'

const SESSION_COOKIE_NAME = 'RSN_session'
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || ''

if (!PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET must be set')
}

export type UserSessionDto = {
  userId: string | null
  scheme: string
  theme: string
}

async function getUserSession(): Promise<UserSessionDto | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const parsedCookies = parse(sessionCookie)
    const token = parsedCookies[SESSION_COOKIE_NAME]
    if (!token) return null
    const decoded = jwt.verify(token, PAYLOAD_SECRET) as JwtPayload
    const userSession: UserSessionDto = {
      userId: decoded.user_id as string,
      scheme: decoded.scheme as string,
      theme: decoded.theme as string,
    }
    return userSession
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[session] error: ' + e.message)
    return null
  }
}

export async function getUserInfo(): Promise<UserSessionDto> {
  const session = await getUserSession()
  const user_id = session?.user_id ?? null
  const scheme = session?.scheme || defaultThemeScheme
  const theme = session?.theme ?? defaultThemeColor
  return {
    user_id,
    scheme,
    theme,
  }
}

export async function resetUserSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: -1, // This deletes the cookie
    httpOnly: true,
  })
}

export async function createUserSession(userSession: UserSessionDto, redirectTo: string = '') {
  const cookieStore = await cookies()
  const token = jwt.sign(userSession, PAYLOAD_SECRET, { expiresIn: '30d' })
  const serializedSession = serialize(SESSION_COOKIE_NAME, token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  })
  cookieStore.set(SESSION_COOKIE_NAME, serializedSession)
  return redirect(redirectTo)
}
