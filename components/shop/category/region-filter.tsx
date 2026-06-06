"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type RegionOption = {
  value: string;
  label: string;
};

const REGION_OPTIONS: readonly RegionOption[] = [
  { value: "global", label: "Global" },
  { value: "latam", label: "LATAM" },
  { value: "chile", label: "Chile" },
  { value: "europe", label: "Europe" },
  { value: "united-states", label: "United States" },
];

interface RegionFilterProps {
  readonly selectedRegions?: string; // Comma-separated list
  readonly onChange: (values: string) => void;
}

export function RegionFilter({
  selectedRegions = "",
  onChange,
}: RegionFilterProps) {
  const activeList = selectedRegions
    ? selectedRegions.split(",").map((v) => v.trim())
    : [];

  const handleToggle = (value: string, checked: boolean) => {
    let newList: string[];
    if (checked) {
      newList = [...activeList, value];
    } else {
      newList = activeList.filter((v) => v !== value);
    }
    onChange(newList.join(","));
  };

  return (
    <div className="space-y-3">
      {REGION_OPTIONS.map((opt) => {
        const isChecked = activeList.includes(opt.value);
        const id = `region-${opt.value}`;

        return (
          <div
            key={opt.value}
            className="flex min-h-11 items-center space-x-2 py-1.5"
          >
            <Checkbox
              id={id}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(opt.value, !!checked)}
            />
            <Label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
            >
              {opt.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
