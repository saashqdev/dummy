import LogoReact from "@/assets/logos/react.png";
import LogoTailwind from "@/assets/logos/tailwindcss.png";
import LogoPrisma from "@/assets/logos/prisma.png";
import LogoPrismaDark from "@/assets/logos/prisma-dark.png";
import LogoStripe from "@/assets/logos/stripe.png";
import LogoPostmark from "@/assets/logos/postmark.png";
import LogoTypescript from "@/assets/logos/typescript.png";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";
import Image from "next/image";
import NextJsLight from "@/components/brand/NextJsLight";
import NextJsDark from "@/components/brand/NextJsDark";

export default function LogoCloudsVariantCustom() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-8 md:grid-cols-4 lg:grid-cols-7">
          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "react",
                value: "https://react.dev",
              }}
              to="https://react.dev"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover md:h-14" src={LogoReact} alt="React" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "typescript",
                value: "https://www.typescriptlang.org",
              }}
              to="https://www.typescriptlang.org"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover md:h-14" src={LogoTypescript} alt="TypeScript" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "prisma",
                value: "https://www.prisma.io/?via=alexandro",
              }}
              to="https://www.prisma.io/?via=alexandro"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover dark:hidden md:h-14" src={LogoPrisma} alt="Next" />
              <Image className="hidden h-10 object-cover dark:block md:h-14" src={LogoPrismaDark} alt="Next" />
            </ButtonEvent>
          </div>
          <div className="order-first col-span-1 flex justify-center lg:order-none">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "next.js",
                value: "https://nextjs.org",
              }}
              to="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
            >
              <NextJsLight className="h-10 w-fit object-cover dark:hidden md:h-14" />
              <NextJsDark className="hidden h-10 w-fit object-cover dark:block md:h-14" />
            </ButtonEvent>
          </div>
          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "tailwindcss",
                value: "https://tailwindcss.com",
              }}
              to="https://tailwindcss.com"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover md:h-14" src={LogoTailwind} alt="Tailwind CSS" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "stripe",
                value: "https://stripe.com",
              }}
              to="https://stripe.com"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover md:h-14" src={LogoStripe} alt="Stripe" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "postmark",
                value: "https://postmarkapp.com",
              }}
              to="https://postmarkapp.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="h-10 object-cover md:h-14" src={LogoPostmark} alt="Postmark" />
            </ButtonEvent>
          </div>
        </div>
      </div>
    </div>
  );
}
