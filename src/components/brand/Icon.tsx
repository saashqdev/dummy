import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  className?: string
  size?: string
  fromConfig?: boolean
}

export default function Icon({ className = '', size = 'h-9', fromConfig = true }: Props) {
  return (
    <Link href="/" className={clsx(className, 'flex')}>
      <Image
        className={clsx(size, 'hidden w-auto dark:block')}
        src={'/assets/img/icon-dark.png'}
        alt="Logo"
      />
      <Image
        className={clsx(size, 'w-auto dark:hidden')}
        src={'/assets/img/icon-light.png'}
        alt="Logo"
      />
    </Link>
  )
}
