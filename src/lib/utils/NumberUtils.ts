import numeral from "numeral";

const defaultCurrencySymbol = "$";

const numberFormat = (value: number): string => {
  try {
    return numeral(value).format("0,0");
  } catch (e) {
    return value?.toString();
  }
};
const decimalFormat = (value: number, decimalPlaces: number = 2): string => {
  try {
    return numeral(value).format(`0,0.${"0".repeat(decimalPlaces)}`);
  } catch (e) {
    return value?.toString();
  }
};
const intFormat = (value: number | string): string => {
  try {
    return numeral(value).format("0,0");
  } catch (e) {
    return value?.toString();
  }
};
const pad = (num: number, size: number) => {
  const s = "000000000" + num;
  return s.substring(s.length - size);
};
const custom = (value: number, format: string): string => {
  try {
    return numeral(value).format(format);
  } catch (e) {
    return value?.toString();
  }
};

export default {
  numberFormat,
  decimalFormat,
  intFormat,
  pad,
  defaultCurrencySymbol,
  custom,
};
