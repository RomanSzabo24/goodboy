"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+421", flag: "/icons/flag-sk.svg", labelKey: "countrySk" },
  { code: "+420", flag: "/icons/flag-cz.svg", labelKey: "countryCz" },
] as const;

function splitPhone(value: string) {
  const match = value.match(/^(\+421|\+420)\s?(.*)$/);
  if (match) return { prefix: match[1], national: match[2] };
  return { prefix: COUNTRY_CODES[0].code, national: value };
}

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function PhoneInput({ id, value, onChange, onBlur, ...props }: PhoneInputProps) {
  const t = useTranslations("personalDetails");
  const { prefix, national } = splitPhone(value);
  const selectedCountry = COUNTRY_CODES.find((country) => country.code === prefix) ?? COUNTRY_CODES[0];

  return (
    <div className="flex gap-4">
      <Select
        value={prefix}
        onValueChange={(nextPrefix) => onChange(`${nextPrefix} ${national}`.trim())}
      >
        <SelectTrigger className="w-20 shrink-0 justify-center" aria-label={t("countryCodeAriaLabel")}>
          <SelectValue>
            <Image
              src={selectedCountry.flag}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              style={{ aspectRatio: "1 / 1" }}
            />
            <span className="sr-only">
              {selectedCountry.code} ({t(selectedCountry.labelKey)})
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <Image
                src={country.flag}
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
                style={{ aspectRatio: "1 / 1" }}
              />
              {country.code}
              <span className="sr-only">{t(country.labelKey)}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={`${prefix} ${t("phonePlaceholder")}`}
        value={national}
        // Not `.trim()`ed: while typing, a group-separating space is always
        // the last character in the string the instant it's pressed, so
        // trimming here would strip it back out before the next digit ever
        // lands next to it — the field would silently refuse "900 123 456"
        // and collapse it to "900123456". Zod's `.trim()` in the schema
        // still cleans up a stray leading/trailing space on submit.
        onChange={(event) => {
          const nextNational = event.target.value;
          onChange(nextNational === "" ? prefix : `${prefix} ${nextNational}`);
        }}
        onBlur={onBlur}
        {...props}
      />
    </div>
  );
}
