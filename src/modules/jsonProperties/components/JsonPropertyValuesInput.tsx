"use client";

import { JsonPropertyDto } from "../dtos/JsonPropertyTypeDto";
import { JsonPropertiesValuesDto, JsonValue } from "../dtos/JsonPropertiesValuesDto";
import InputImage from "@/components/ui/input/InputImage";
import InputSelect from "@/components/ui/input/InputSelect";
import InputCombobox from "@/components/ui/input/InputCombobox";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";
import InputGroup from "@/components/ui/forms/InputGroup";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function JsonPropertyValuesInput({
  prefix = "attributes",
  properties,
  attributes,
}: {
  prefix?: string;
  properties: JsonPropertyDto[] | JsonValue | null;
  attributes: JsonPropertiesValuesDto | null;
}) {
  let propertiesObj = properties as JsonPropertyDto[] | null;
  if (!propertiesObj) {
    return null;
  }
  const groups: { name: string; properties: JsonPropertyDto[] }[] = [];
  propertiesObj.forEach((property) => {
    let group = groups.find((g) => g.name === property.group);
    if (!group) {
      group = { name: property.group || "", properties: [] };
      groups.push(group);
    }
    group.properties.push(property);
  });
  return (
    <Fragment>
      {groups.map((group, idx) => {
        return (
          <Fragment key={idx}>
            {group.name ? (
              <InputGroup title={group.name} className="space-y-2">
                <GroupInputs prefix={prefix} properties={group.properties} attributes={attributes} />
              </InputGroup>
            ) : (
              <GroupInputs prefix={prefix} properties={group.properties} attributes={attributes} />
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
}

function GroupInputs({ prefix, properties, attributes }: { prefix: string; properties: JsonPropertyDto[]; attributes: JsonPropertiesValuesDto | null }) {
  let propertiesObj = properties as JsonPropertyDto[] | null;
  return (
    <Fragment>
      {propertiesObj?.map((property) => {
        return (
          <div key={property.name}>
            <JsonPropertyInput prefix={prefix} property={property} attributes={attributes} />
          </div>
        );
      })}
    </Fragment>
  );
}

function JsonPropertyInput({ prefix, property, attributes }: { prefix: string; property: JsonPropertyDto; attributes: JsonPropertiesValuesDto | null }) {
  const { t } = useTranslation();
  let value: JsonValue | undefined = attributes ? attributes[property.name] : undefined;

  switch (property.type) {
    case "string":
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <label htmlFor={`${prefix}[${property.name}]`} className="mb-1 text-xs font-medium">
            {t(property.title)} {property.required && <span className="text-red-500">*</span>}
          </label>
          <Input name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={stringValue} required={property.required} />
        </div>
      );
    case "number": {
      let numberValue = value === undefined ? undefined : (value as number);
      const defaultNumberValue = property.defaultValue === undefined ? undefined : (property.defaultValue as number);
      if (numberValue === undefined && defaultNumberValue !== undefined) {
        numberValue = defaultNumberValue;
      }
      return (
        <div>
          <label htmlFor={`${prefix}[${property.name}]`} className="mb-1 text-xs font-medium">
            {t(property.title)} {property.required && <span className="text-red-500">*</span>}
          </label>
          <Input type="number" name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={numberValue} required={property.required} />
        </div>
      );
    }
    case "boolean": {
      let booleanValue = value === undefined ? undefined : value === "true" || value === true || value === 1 || value === "1";
      const defaultBooleanValue =
        property.defaultValue === undefined
          ? undefined
          : property.defaultValue === "true" || property.defaultValue === true || property.defaultValue === 1 || property.defaultValue === "1";
      if (booleanValue === undefined && defaultBooleanValue !== undefined) {
        booleanValue = defaultBooleanValue;
      }
      return (
        <div className="flex items-center space-x-2">
          <Checkbox name={`${prefix}[${property.name}]`} title={t(property.title)} defaultChecked={booleanValue} />
          <label htmlFor={`${prefix}[${property.name}]`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t(property.title)}
          </label>
        </div>
      );
    }
    case "date": {
      let dateValue = !value ? undefined : new Date(value as string);
      const defaultDateValue = property.defaultValue === undefined ? undefined : new Date(property.defaultValue as string);
      if (dateValue === undefined && defaultDateValue !== undefined) {
        dateValue = defaultDateValue;
      }
      return (
        <div>
          <label htmlFor={`${prefix}[${property.name}]`} className="mb-1 text-xs font-medium">
            {t(property.title)} {property.required && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="date"
            name={`${prefix}[${property.name}]`}
            title={t(property.title)}
            defaultValue={dateValue?.toISOString().split("T")[0]}
            required={property.required}
          />
        </div>
      );
    }
    case "image": {
      let imageValue = value === undefined ? undefined : (value as string);
      const defaultImageValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (imageValue === undefined && defaultImageValue !== undefined) {
        imageValue = defaultImageValue;
      }
      return (
        <div>
          <InputImage name={`${prefix}[${property.name}]`} title={t(property.title)} defaultValue={imageValue} required={property.required} />
        </div>
      );
    }
    case "select": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return (
        <div>
          <div>
            <label className="mb-1 text-xs font-medium">
              {t(property.title)} {property.required && <span className="text-red-500">*</span>}
            </label>
            <InputSelect
              name={`${prefix}[${property.name}]`}
              defaultValue={stringValue}
              required={property.required}
              options={property.options?.filter((f) => f.value) || []}
              placeholder={`${t("shared.select")}...`}
            />
          </div>
        </div>
      );
    }
    case "multiselect": {
      let arrValue = value === undefined ? [] : (value as Array<string>);
      const defaultArrValue = property.defaultValue === undefined ? [] : (property.defaultValue as Array<string>);
      if (!value && defaultArrValue.length > 0) {
        arrValue = defaultArrValue;
      }
      return <JsonMultiSelectInput prefix={prefix} property={property} initial={arrValue} />;
    }
    case "content": {
      let stringValue = value === undefined ? undefined : (value as string);
      const defaultStringValue = property.defaultValue === undefined ? undefined : (property.defaultValue as string);
      if (stringValue === undefined && defaultStringValue !== undefined) {
        stringValue = defaultStringValue;
      }
      return <ContentForm name={`${prefix}[${property.name}]`} value={stringValue} title={t(property.title)} required={property.required} />;
    }
    default:
      return null;
  }
}

function JsonMultiSelectInput({ prefix, property, initial }: { prefix: string; property: JsonPropertyDto; initial: string[] }) {
  const { t } = useTranslation();
  const [actualValue, setActualValue] = useState<(string | number)[]>(initial);
  return (
    <div>
      {actualValue?.map((item, idx) => {
        return <input key={idx} type="hidden" name={`${prefix}[${property.name}][]`} value={item} />;
      })}
      <InputCombobox
        title={t(property.title)}
        value={actualValue}
        onChange={setActualValue}
        required={property.required}
        options={property.options?.filter((f) => f.value) || []}
        withSearch={false}
      />
    </div>
  );
}

function ContentForm({ name, value, title, required }: { name: string; value: string | undefined; title: string; required: boolean }) {
  const [content, setContent] = useState(value);

  return (
    <div className="space-y-2">
      <div className="grid gap-3">
        <div>
          <label htmlFor="content" className="mb-1 text-xs font-medium">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            name={name}
            className="col-span-12 h-[calc(100vh-320px)] overflow-y-auto"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  );
}
