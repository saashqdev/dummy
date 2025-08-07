"use client";

import clsx from "clsx";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import HintTooltip from "@/components/ui/tooltips/HintTooltip";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { useTranslation } from "react-i18next";
import DateUtils from "@/lib/utils/DateUtils";
import { Input } from "../input";

interface Props {
  display?: "default" | "calendar";
  name?: string;
  title: string;
  defaultValue?: Date | undefined;
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  help?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hint?: ReactNode;
  darkMode?: boolean;
  autoFocus?: boolean;
}
export default function InputDate({
  display = "default",
  name,
  title,
  value,
  defaultValue,
  onChange,
  className,
  help,
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus,
}: Props) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);

  const [actualValue, setActualValue] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (defaultValue) {
      // setActualValue(defaultValue?.toISOString().split("T")[0]);
      setActualValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (date) {
        // setActualValue(date.toISOString().split("T")[0]);
        setActualValue(date);
      }
    }
  }, [value]);

  useEffect(() => {
    if (defaultValue) {
      const date = new Date(defaultValue);
      if (date) {
        // setActualValue(date.toISOString().split("T")[0]);
        setActualValue(date);
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    if (onChange && actualValue) {
      let isDifferent = false;
      try {
        if (value && actualValue) {
          isDifferent = value.toISOString() !== actualValue.toISOString();
        }
      } catch {
        isDifferent = true;
      }
      if (isDifferent) {
        const date = new Date(actualValue);
        if (date) {
          onChange(date);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualValue]);

  return (
    <div className={clsx(className)}>
      <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium">
        <div className="flex items-center space-x-1">
          <div className="truncate">
            {title}
            {required && <span className="ml-1 text-red-500">*</span>}
          </div>

          {help && <HintTooltip text={help} />}
        </div>
      </label>
      <div className="relative mt-1 flex w-full rounded-md">
        {display === "default" && (
          <Input
            ref={input}
            type="date"
            id={name}
            name={name}
            required={required}
            value={actualValue?.toISOString().split("T")[0]}
            onChange={(e) => {
              const date = new Date(e.currentTarget.value);
              if (date) {
                setActualValue(date);
              }
            }}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className={clsx((disabled || readOnly) && "cursor-not-allowed bg-gray-100")}
          />
        )}
        {display === "calendar" && (
          <Fragment>
            {name && (
              <input
                type="hidden"
                name={name}
                value={actualValue?.toISOString().split("T")[0]}
                required={required}
                disabled={actualValue === undefined}
                hidden
                readOnly
              />
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={clsx("w-full justify-start text-left font-normal", !actualValue && "text-muted-foreground")}
                  disabled={disabled || readOnly}
                  autoFocus={autoFocus}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualValue ? format(actualValue, DateUtils.dateYMD(actualValue)) : t("shared.pickDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={actualValue} onSelect={(date) => setActualValue(date)} />
              </PopoverContent>
            </Popover>
          </Fragment>
        )}
      </div>
    </div>
  );
}
