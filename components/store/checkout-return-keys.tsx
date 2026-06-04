"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconKey } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { CheckoutReturnKeyItem } from "@/lib/store/checkout/return-keys";

type CheckoutReturnKeysProps = {
  keys: CheckoutReturnKeyItem[];
};

export function CheckoutReturnKeys({ keys }: CheckoutReturnKeysProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard denied
    }
  }

  if (keys.length === 0) return null;

  return (
    <div className="w-full space-y-3 text-left">
      <p className="text-xs font-semibold text-foreground flex items-center gap-2 justify-center sm:justify-start">
        <IconKey className="size-3.5 text-primary shrink-0" aria-hidden />
        Tus keys
      </p>
      <ul className="space-y-3">
        {keys.map((key) => (
          <li
            key={key.id}
            className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3 space-y-2"
          >
            <p className="text-xs font-medium text-foreground truncate">
              {key.productName}
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-background border border-border/50 p-2.5 font-mono text-xs">
              <span className="flex-1 break-all font-bold tracking-wide text-foreground select-all">
                {key.serial}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                aria-label="Copiar key"
                onClick={() => void handleCopy(key.serial, key.id)}
              >
                {copiedId === key.id ? (
                  <IconCheck className="size-4 text-emerald-500" aria-hidden />
                ) : (
                  <IconCopy className="size-4" aria-hidden />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
