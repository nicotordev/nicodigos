"use client";

import { useState, useTransition } from "react";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { assistSystemRequirementsAction } from "@/lib/admin/ai/actions";
import type { AiProductContext, AiTextTask } from "@/lib/admin/ai/types";
import { AI_TEXT_TASK_LABELS } from "@/lib/admin/ai/types";
import type { SystemRequirementInput } from "@/lib/admin/products/schemas";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

type AiSystemRequirementsToolbarProps = {
  configured: boolean;
  productContext: AiProductContext;
  currentBlocks: SystemRequirementInput[];
  onApply: (blocks: SystemRequirementInput[]) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export function AiSystemRequirementsToolbar({
  configured,
  productContext,
  currentBlocks,
  onApply,
  onError,
  disabled = false,
  className,
}: AiSystemRequirementsToolbarProps) {
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  function runTask(task: AiTextTask) {
    setLocalError(null);
    onError?.("");

    startTransition(async () => {
      const result = await assistSystemRequirementsAction({
        task,
        productContext,
        currentBlocks,
      });

      if (!result.success) {
        setLocalError(result.error);
        onError?.(result.error);
        return;
      }

      onApply(result.requirements);
      onError?.("");
    });
  }

  const busy = disabled || isPending;

  if (!configured) {
    return (
      <p className={`text-xs text-muted-foreground ${className ?? ""}`}>
        IA desactivada: configura OPENAI_API_KEY en el servidor.
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            className="h-8 gap-1.5"
          >
            {isPending ? (
              <Spinner className="size-3.5" />
            ) : (
              <IconSparkles className="size-3.5" />
            )}
            IA · todos los bloques
            <IconChevronDown className="size-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Requisitos · Chile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(AI_TEXT_TASK_LABELS) as AiTextTask[]).map((task) => {
            const { label, description } = AI_TEXT_TASK_LABELS[task];
            return (
              <DropdownMenuItem
                key={task}
                disabled={busy}
                onSelect={() => runTask(task)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {localError ? (
        <p className="text-xs text-destructive">{localError}</p>
      ) : null}
    </div>
  );
}
