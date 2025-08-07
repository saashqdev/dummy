import Link from 'next/link'
import { actionLogout } from '@/app/(marketing)/actions'
import { Button } from './ui/button'
import { getUserInfo } from '@/lib/services/session.server'
import LocaleSelector from './ui/selectors/LocaleSelector'
import ThemeSelector from './ui/selectors/ThemeSelector'
import DarkModeToggle from './ui/toggles/DarkModeToggle'

export default async function Header() {
  const userInfo = await getUserInfo()
  return (
    <header className="flex w-full justify-center p-4">
      <div className="flex items-center justify-between gap-5">
        <nav className="flex items-center gap-5">
          <Link href="/" className="mr-4">
            Home
          </Link>
          <Link href="/contact" className="mr-4">
            Contact
          </Link>
          <Link href="/login" className="mr-4">
            Login
          </Link>
          <Link href="/app" className="mr-4">
            App
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
          <div className="flex flex-row items-center justify-center gap-4">
            <LocaleSelector />
            <ThemeSelector currentTheme={userInfo.theme} />
            <DarkModeToggle currentScheme={userInfo.scheme} />
          </div>

          <div>
            {userInfo.user_id ? (
              <form action={actionLogout}>
                <Button>Logout</Button>
              </form>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
