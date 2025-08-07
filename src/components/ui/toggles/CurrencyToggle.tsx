import React, { Fragment } from "react";
import InputSelect from "../input/InputSelect";

interface Props {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  possibleCurrencies: string[];
  darkMode?: boolean;
}

export default function CurrencyToggle({ className, value, onChange, possibleCurrencies, darkMode }: Props) {
  // function changeCurrency(currency: string) {
  //   onChange(currency);
  // }
  return (
    <Fragment>
      {possibleCurrencies.length === 1 ? null : (
        <div className={className}>
          <InputSelect
            value={value}
            onChange={(e) => onChange(e?.toString() ?? "")}
            options={possibleCurrencies.map((item) => {
              return {
                value: item,
                name: item.toUpperCase(),
              };
            })}
          />
        </div>
      )}
    </Fragment>
  );
}
