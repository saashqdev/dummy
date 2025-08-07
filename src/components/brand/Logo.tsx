import LogoLight from "@/assets/img/logo-light.png";
import LogoDark from "@/assets/img/logo-dark.png";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

interface Props {
  className?: string;
  size?: string;
  to?: string;
}

export default function Logo({ className = "", size = "h-9", to }: Props) {
  return (
    <Link href={to ?? "/"} className={clsx(className, "flex")}>
      <Image className={clsx(size, "mx-auto hidden w-auto dark:block")} src={LogoDark} alt="Logo" />
      <Image className={clsx(size, "mx-auto w-auto dark:hidden")} src={LogoLight} alt="Logo" />
    </Link>
  );
}
