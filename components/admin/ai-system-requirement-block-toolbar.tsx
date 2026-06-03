"use client";

import { useState, useTransition } from "react";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { assistSystemRequirementBlockAction } from "@/lib/admin/ai/actions";
import {
  AI_TEXT_TASK_LABELS,
  type AiProductContext,
  type AiTextTask,
} from "@/lib/admin/ai/types";
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

type AiSystemRequirementBlockToolbarProps = {
  configured: boolean;
  productContext: AiProductContext;
  systemName: string;
  requirementLines: string;
  onApply: (lines: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function AiSystemRequirementBlockToolbar({
  configured,
  productContext,
  systemName,
  requirementLines,
  onApply,
  onError,
  disabled = false,
}: AiSystemRequirementBlockToolbarProps) {
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  function runTask(task: AiTextTask) {
    setLocalError(null);
    onError?.("");

    startTransition(async () => {
      const result = await assistSystemRequirementBlockAction({
        task,
        productContext,
        systemName,
        requirementLines,
      });

      if (!result.success) {
        setLocalError(result.error);
        onError?.(result.error);
        return;
      }

      onApply(result.text);
      onError?.("");
    });
  }

  const busy = disabled || isPending;

  if (!configured) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
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
            IA
            <IconChevronDown className="size-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Este bloque</DropdownMenuLabel>
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
