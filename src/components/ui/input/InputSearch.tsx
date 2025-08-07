"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Input } from "../input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function InputSearch({ value, onChange, placeholder, className, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <div className={clsx("flex justify-between space-x-2", className)}>
      <div className="relative flex w-full flex-auto items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 focus-within:z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Input
          type="text"
          className="bg-background pl-9"
          placeholder={placeholder ?? t("shared.searchDot")}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
