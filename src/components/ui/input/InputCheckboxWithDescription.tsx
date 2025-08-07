import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import HintTooltip from "../tooltips/HintTooltip";
import { Checkbox } from "../checkbox";

interface Props {
  name?: string;
  title?: string | ReactNode;
  description: string | ReactNode;
  // value?: boolean;
  onChange?: (value: boolean) => void;
  defaultValue?: boolean;
  className?: string;
  help?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}
export default function InputCheckboxWithDescription({
  name,
  title,
  // value,
  onChange,
  defaultValue,
  description,
  className,
  help,
  disabled = false,
  autoFocus,
}: Props) {
  // const [checked, setChecked] = useState(value ?? false);

  // useEffect(() => {
  //   if (value !== checked) {
  //     setChecked(value ?? false);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [value]);

  // useEffect(() => {
  //   if (onChange && value !== checked) {
  //     onChange(checked);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [checked]);

  return (
    <div className={clsx("relative flex items-start pb-4 pt-2", className)}>
      <div className="min-w-0 flex-1 text-sm">
        <label htmlFor={name} className="cursor-pointer select-none">
          <div className="font-medium">{title}</div>

          {help && <HintTooltip text={help} />}

          <div id={name + "-description"} className="text-gray-400">
            {description}
          </div>
        </label>
      </div>
      <div className="ml-3 flex h-5 items-center">
        <input
          type="checkbox"
          id={name}
          aria-describedby={name + "-description"}
          name={name}
          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          // checked={checked}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          defaultChecked={defaultValue}
          disabled={disabled}
          autoFocus={autoFocus}
          // className={clsx(disabled && "cursor-not-allowed bg-gray-100", "text-accent-600 focus:ring-accent-500 h-4 w-4 cursor-pointer rounded border-gray-300")}
        />
      </div>
    </div>
  );
}
