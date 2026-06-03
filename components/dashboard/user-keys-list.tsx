"use client";

import * as React from "react";
import Link from "next/link";
import { IconKey, IconCopy, IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatDate } from "@/lib/admin/format";
import { formatOrderKeyStatusEs } from "@/lib/dashboard/format";
import type { UserKeyItem } from "@/lib/dashboard/queries";
import type { OrderKeyStatus } from "@/lib/generated/prisma/client";

const statusStyles: Record<
  OrderKeyStatus,
  string
> = {
  PENDING: "bg-muted text-muted-foreground border-border",
  PROCESSING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  RETURNED: "bg-destructive/10 text-destructive border-destructive/20",
  REFUNDED: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/20",
};

type UserKeysListProps = {
  keys: UserKeyItem[];
};

export function UserKeysList({ keys }: UserKeysListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (keys.length === 0) {
    return (
      <Empty className="border border-dashed border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconKey />
          </EmptyMedia>
          <EmptyTitle>Sin claves todavía</EmptyTitle>
          <EmptyDescription>
            Cuando completes un pedido, tus claves digitales aparecerán aquí.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild className="rounded-xl">
            <Link href="/">Ir a la tienda</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {keys.map((key) => (
        <li key={key.id}>
          <Card size="sm" className="h-full border border-border/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow bg-card flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <IconKey className="size-4.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <CardTitle className="text-sm font-semibold text-foreground truncate">
                      {key.productName}
                    </CardTitle>
                    <CardDescription className="text-[11px] truncate">
                      Pedido #{key.orderId.slice(-8).toUpperCase()} · {formatDate(key.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={statusStyles[key.status]}>
                  {formatOrderKeyStatusEs(key.status)}
                </Badge>
              </CardHeader>
              
              <CardContent className="text-[11px] text-muted-foreground border-t border-border/20 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span>ID de Clave</span>
                  <span className="font-mono text-foreground font-medium uppercase">{key.id.slice(-8)}</span>
                </div>
                
                {key.status === "DELIVERED" && key.serial ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-2.5 font-mono text-xs border border-border/50">
                    <span className="flex-1 truncate font-bold tracking-wider text-foreground select-all">
                      {key.serial}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(key.serial ?? "", key.id)}
                    >
                      {copiedId === key.id ? (
                        <IconCheck className="size-4.5 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-4.5" />
                      )}
                    </Button>
                  </div>
                ) : null}

                {(key.status === "PENDING" || key.status === "PROCESSING") ? (
                  <div className="mt-3 rounded-xl bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400/90 border border-amber-500/10 flex items-center gap-2">
                    <span className="flex size-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                    <span>Tu clave digital se está procesando y estará lista pronto.</span>
                  </div>
                ) : null}
              </CardContent>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
