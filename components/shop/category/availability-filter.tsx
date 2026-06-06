"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type AvailabilityOption = {
  value: string;
  label: string;
};

const AVAILABILITY_OPTIONS: readonly AvailabilityOption[] = [
  { value: "in-stock", label: "En stock" },
  { value: "out-of-stock", label: "Sin stock" },
  { value: "offers", label: "En oferta" },
  { value: "featured", label: "Destacados" },
  { value: "preorders", label: "Preventas" },
];

interface AvailabilityFilterProps {
  readonly selectedAvailability?: string; // Comma-separated list
  readonly onChange: (values: string) => void;
}

export function AvailabilityFilter({
  selectedAvailability = "",
  onChange,
}: AvailabilityFilterProps) {
  const activeList = selectedAvailability
    ? selectedAvailability.split(",").map((v) => v.trim())
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
      {AVAILABILITY_OPTIONS.map((opt) => {
        const isChecked = activeList.includes(opt.value);
        const id = `availability-${opt.value}`;

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
