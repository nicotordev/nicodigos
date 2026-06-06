"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PLATFORMS: readonly string[] = [
  "Steam",
  "Xbox",
  "PlayStation",
  "Nintendo",
  "Epic Games",
  "GOG",
  "Microsoft",
  "Windows",
  "Office",
];

interface PlatformFilterProps {
  readonly selectedPlatforms?: string; // Comma-separated list of active platforms
  readonly onChange: (platforms: string) => void;
}

export function PlatformFilter({
  selectedPlatforms = "",
  onChange,
}: PlatformFilterProps) {
  const activeList = selectedPlatforms
    ? selectedPlatforms.split(",").map((p) => p.trim())
    : [];

  const handleToggle = (platform: string, checked: boolean) => {
    let newList: string[];
    if (checked) {
      newList = [...activeList, platform];
    } else {
      newList = activeList.filter((p) => p !== platform);
    }
    onChange(newList.join(","));
  };

  return (
    <div className="space-y-3">
      {PLATFORMS.map((platform) => {
        const isChecked = activeList.includes(platform);
        const id = `platform-${platform.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

        return (
          <div key={platform} className="flex items-center space-x-2 py-1">
            <Checkbox
              id={id}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(platform, !!checked)}
            />
            <Label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
            >
              {platform}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
