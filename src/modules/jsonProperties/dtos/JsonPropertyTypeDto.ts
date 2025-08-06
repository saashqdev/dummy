import { JsonValue } from "./JsonPropertiesValuesDto";

export const JsonPropertyTypes = [
  {
    value: "string",
  },
  {
    value: "number",
  },
  {
    value: "boolean",
  },
  {
    value: "image",
  },
  {
    value: "date",
  },
  {
    value: "select",
  },
  {
    value: "multiselect",
  },
  {
    value: "content",
  },
] as const;

export type JsonPropertyType = (typeof JsonPropertyTypes)[number]["value"];

export type JsonPropertyDto = {
  name: string;
  title: string;
  type: JsonPropertyType;
  required: boolean;
  defaultValue?: JsonValue;
  options?: { name: string; value: string }[] | null;
  group?: string;
  order?: number;
};
