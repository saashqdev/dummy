import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  className?: string
  size?: string
  to?: string
}

export default function Logo({ className = '', size = 'h-9', to }: Props) {
  return (
    <Link href={to ?? '/'} className={clsx(className, 'flex')}>
      <Image
        className={clsx(size, 'mx-auto hidden w-auto dark:block')}
        src={'/assets/img/logo-dark.png'}
        alt="Logo"
      />
      <Image
        className={clsx(size, 'mx-auto w-auto dark:hidden')}
        src={'/assets/img/logo-light.png'}
        alt="Logo"
      />
    </Link>
  )
}
