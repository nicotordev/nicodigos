"use client";

import { useState, useTransition } from "react";
import { IconChevronDown, IconSparkles } from "@tabler/icons-react";
import { assistProductTextAction } from "@/lib/admin/ai/actions";
import {
  AI_TEXT_TASK_LABELS,
  type AiCategoryContext,
  type AiProductContext,
  type AiTextField,
  type AiTextTask,
} from "@/lib/admin/ai/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type AiTextAssistToolbarProps = {
  configured: boolean;
  field: AiTextField;
  value: string;
  productContext?: AiProductContext;
  categoryContext?: AiCategoryContext;
  requireUserPrompt?: boolean;
  userPromptLabel?: string;
  userPromptPlaceholder?: string;
  onApply: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

export function AiTextAssistToolbar({
  configured,
  field,
  value,
  productContext,
  categoryContext,
  requireUserPrompt = false,
  userPromptLabel = "Instrucciones para la IA",
  userPromptPlaceholder = "Describe qué quieres que redacte la IA: tono, enfoque, qué destacar…",
  onApply,
  onError,
  disabled = false,
  className,
}: AiTextAssistToolbarProps) {
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<AiTextTask | null>(null);
  const [userPromptDraft, setUserPromptDraft] = useState("");

  function runTask(task: AiTextTask, userPrompt?: string) {
    setLocalError(null);
    onError?.("");

    startTransition(async () => {
      const result = await assistProductTextAction({
        task,
        field,
        currentText: value,
        userPrompt,
        productContext,
        categoryContext,
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

  function handleTaskSelect(task: AiTextTask) {
    if (requireUserPrompt) {
      setPendingTask(task);
      setUserPromptDraft("");
      return;
    }

    runTask(task);
  }

  function handleConfirmPrompt() {
    if (!pendingTask) {
      return;
    }

    const trimmedPrompt = userPromptDraft.trim();
    if (!trimmedPrompt) {
      setLocalError("Escribe instrucciones para la IA antes de continuar.");
      return;
    }

    const task = pendingTask;
    setPendingTask(null);
    setUserPromptDraft("");
    runTask(task, trimmedPrompt);
  }

  const busy = disabled || isPending;
  const errorMessage = localError;
  const pendingTaskLabel = pendingTask
    ? AI_TEXT_TASK_LABELS[pendingTask].label
    : null;

  if (!configured) {
    return (
      <p className={`text-xs text-muted-foreground ${className ?? ""}`}>
        IA desactivada: configura OPENAI_API_KEY en el servidor.
      </p>
    );
  }

  return (
    <>
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
              Asistencia IA
              <IconChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Español · Chile</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(AI_TEXT_TASK_LABELS) as AiTextTask[]).map((task) => {
              const { label, description } = AI_TEXT_TASK_LABELS[task];
              return (
                <DropdownMenuItem
                  key={task}
                  disabled={busy}
                  onSelect={() => handleTaskSelect(task)}
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
        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>

      <Dialog
        open={pendingTask != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingTask(null);
            setUserPromptDraft("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingTaskLabel ? `IA: ${pendingTaskLabel}` : "Asistencia IA"}
            </DialogTitle>
            <DialogDescription>
              Indica qué debe hacer la IA con la descripción de la categoría.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="ai-user-prompt">{userPromptLabel}</FieldLabel>
            <Textarea
              id="ai-user-prompt"
              value={userPromptDraft}
              onChange={(event) => setUserPromptDraft(event.target.value)}
              placeholder={userPromptPlaceholder}
              rows={5}
              disabled={busy}
              autoFocus
            />
            <FieldDescription>
              Cuanto más específicas sean las instrucciones, mejor será el
              resultado.
            </FieldDescription>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingTask(null);
                setUserPromptDraft("");
              }}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPrompt}
              disabled={busy || !userPromptDraft.trim()}
            >
              {isPending ? <Spinner className="size-4" /> : null}
              {pendingTaskLabel ?? "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
