"use client";

import { cn } from "@/lib/utils";

export type AuthMethod = "magic-link" | "password";

export interface AuthMethodTabsProps {
  method: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
  className?: string;
}

export function AuthMethodTabs({
  method,
  onMethodChange,
  className,
}: AuthMethodTabsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/40 p-1",
        className,
      )}
      role="tablist"
      aria-label="Método de acceso"
    >
      <button
        type="button"
        role="tab"
        aria-selected={method === "magic-link"}
        className={cn(
          "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          method === "magic-link"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onMethodChange("magic-link")}
      >
        Enlace por correo
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={method === "password"}
        className={cn(
          "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          method === "password"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onMethodChange("password")}
      >
        Contraseña
      </button>
    </div>
  );
}
