"use client";

import { cn } from "@/lib/utils";
import type { SettingsSectionId } from "@/lib/settings/types";

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
};

type SettingsNavProps = {
  items: SettingsNavItem[];
  activeId: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
  className?: string;
};

export function SettingsNav({
  items,
  activeId,
  onSelect,
  className,
}: SettingsNavProps) {
  return (
    <nav
      aria-label="Secciones de configuración"
      className={cn("flex flex-col gap-1", className)}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              const el = document.getElementById(item.id);
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-current={isActive ? "true" : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
