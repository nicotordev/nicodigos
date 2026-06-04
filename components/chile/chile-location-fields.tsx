"use client";

import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getChileCityOptions,
  getChileCommuneOptions,
  getChileRegionOptions,
  resolveChileCommuneCode,
  resolveChileRegionName,
  resolveChileRegionNumber,
} from "@/lib/chile/locations";
import { cn } from "@/lib/utils";

const REGION_PLACEHOLDER = "Selecciona una región";
const COMMUNE_PLACEHOLDER = "Selecciona una comuna";
const CITY_PLACEHOLDER = "Selecciona una ciudad";

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export type ChileLocationValues = {
  region: string;
  commune: string;
  city: string;
};

type ChileLocationFieldsProps = {
  values: ChileLocationValues;
  onChange: (patch: Partial<ChileLocationValues>) => void;
  disabled?: boolean;
  idPrefix?: string;
  className?: string;
};

export function ChileLocationFields({
  values,
  onChange,
  disabled = false,
  idPrefix = "chile-location",
  className,
}: ChileLocationFieldsProps) {
  const regionOptions = useMemo(() => getChileRegionOptions(), []);

  const regionNumber = useMemo(
    () => resolveChileRegionNumber(values.region),
    [values.region],
  );

  const communeCode = useMemo(
    () => resolveChileCommuneCode(regionNumber, values.commune),
    [regionNumber, values.commune],
  );

  const communeOptions = useMemo(
    () => (regionNumber ? getChileCommuneOptions(regionNumber) : []),
    [regionNumber],
  );

  const cityOptions = useMemo(
    () =>
      regionNumber && communeCode
        ? getChileCityOptions(regionNumber, communeCode)
        : [],
    [regionNumber, communeCode],
  );

  const regionSelectValue = regionNumber ?? "";
  const communeSelectValue = communeCode ?? "";
  const citySelectValue =
    cityOptions.find((option) => option.label === values.city.trim())?.label ??
    "";

  function handleRegionChange(nextRegionNumber: string) {
    onChange({
      region: resolveChileRegionName(nextRegionNumber),
      commune: "",
      city: "",
    });
  }

  function handleCommuneChange(nextCommuneCode: string) {
    const option = communeOptions.find(
      (item) => item.value === nextCommuneCode,
    );
    if (!option) return;

    onChange({
      commune: option.label,
      city: option.label,
    });
  }

  function handleCityChange(nextCityLabel: string) {
    onChange({ city: nextCityLabel });
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-region`}>
          Región
          <RequiredMark />
        </Label>
        <Select
          value={regionSelectValue}
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-region`} className="w-full">
            <SelectValue placeholder={REGION_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-commune`}>
          Comuna
          <RequiredMark />
        </Label>
        <Select
          value={communeSelectValue}
          onValueChange={handleCommuneChange}
          disabled={disabled || !regionNumber}
        >
          <SelectTrigger id={`${idPrefix}-commune`} className="w-full">
            <SelectValue placeholder={COMMUNE_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {communeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>
          Ciudad
          <RequiredMark />
        </Label>
        <Select
          value={citySelectValue}
          onValueChange={handleCityChange}
          disabled={disabled || !communeCode}
        >
          <SelectTrigger id={`${idPrefix}-city`} className="w-full">
            <SelectValue placeholder={CITY_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {cityOptions.map((option) => (
              <SelectItem key={option.value} value={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Localidades de la misma provincia que la comuna elegida.
        </p>
      </div>
    </div>
  );
}
