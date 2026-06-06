"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type PriceRangeOption = {
  label: string;
  minPrice: string;
  maxPrice: string;
};

const PRICE_RANGES: readonly PriceRangeOption[] = [
  { label: "Bajo $5.000", minPrice: "", maxPrice: "5000" },
  { label: "$5.000 - $10.000", minPrice: "5000", maxPrice: "10000" },
  { label: "$10.000 - $20.000", minPrice: "10000", maxPrice: "20000" },
  { label: "$20.000 - $40.000", minPrice: "20000", maxPrice: "40000" },
  { label: "Sobre $40.000", minPrice: "40000", maxPrice: "" },
];

interface PriceFilterProps {
  readonly currentMinPrice?: string;
  readonly currentMaxPrice?: string;
  readonly onChange: (min: string, max: string) => void;
}

export function PriceFilter({
  currentMinPrice = "",
  currentMaxPrice = "",
  onChange,
}: PriceFilterProps) {
  return (
    <div className="space-y-3">
      {PRICE_RANGES.map((range) => {
        const isActive =
          currentMinPrice === range.minPrice && currentMaxPrice === range.maxPrice;

        const handleCheckboxChange = (checked: boolean) => {
          if (checked) {
            onChange(range.minPrice, range.maxPrice);
          } else {
            onChange("", "");
          }
        };

        const id = `price-${range.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

        return (
          <div key={range.label} className="flex items-center space-x-2 py-1">
            <Checkbox
              id={id}
              checked={isActive}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
            >
              {range.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
