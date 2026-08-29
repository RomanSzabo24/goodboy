"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+421", flag: "🇸🇰", label: "Slovensko" },
  { code: "+420", flag: "🇨🇿", label: "Česko" },
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
};

export function PhoneInput({ id, value, onChange, onBlur, ...props }: PhoneInputProps) {
  const { prefix, national } = splitPhone(value);

  return (
    <div className="flex gap-2">
      <Select
        value={prefix}
        onValueChange={(nextPrefix) => onChange(`${nextPrefix} ${national}`.trim())}
      >
        <SelectTrigger className="w-[104px] shrink-0" aria-label="Country code">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span aria-hidden="true">{country.flag}</span>
              {country.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="900 000 000"
        value={national}
        onChange={(event) => onChange(`${prefix} ${event.target.value}`.trim())}
        onBlur={onBlur}
        {...props}
      />
    </div>
  );
}
