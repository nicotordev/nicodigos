"use client";

import { useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { AiSystemRequirementBlockToolbar } from "@/components/admin/ai-system-requirement-block-toolbar";
import { AiSystemRequirementsToolbar } from "@/components/admin/ai-system-requirements-toolbar";
import type { AiProductContext } from "@/lib/admin/ai/types";
import type { SystemRequirementInput } from "@/lib/admin/products/schemas";
import type { KinguinSystemRequirement } from "@/types/kinguin";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_BLOCKS = 12;

export type SystemRequirementItem = SystemRequirementInput & {
  clientId: string;
};

function newClientId(): string {
  return crypto.randomUUID();
}

function requirementsToText(lines: string[]): string {
  return lines.join("\n");
}

function textToRequirements(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function mapProductSystemRequirements(
  requirements: KinguinSystemRequirement[],
): SystemRequirementItem[] {
  return requirements.map((req) => ({
    clientId: newClientId(),
    system: req.system,
    requirement: [...req.requirement],
  }));
}

function emptyBlock(): SystemRequirementItem {
  return {
    clientId: newClientId(),
    system: "",
    requirement: [],
  };
}

type ProductSystemRequirementsEditorProps = {
  items: SystemRequirementItem[];
  onChange: (items: SystemRequirementItem[]) => void;
  disabled?: boolean;
  openAiConfigured?: boolean;
  aiProductContext?: AiProductContext;
  onAiError?: (message: string) => void;
};

function mapAiBlocksToItems(
  blocks: SystemRequirementInput[],
): SystemRequirementItem[] {
  return blocks.map((block) => ({
    clientId: newClientId(),
    system: block.system,
    requirement: [...block.requirement],
  }));
}

function blocksForAi(items: SystemRequirementItem[]): SystemRequirementInput[] {
  return items.map(({ system, requirement }) => ({ system, requirement }));
}

export function ProductSystemRequirementsEditor({
  items,
  onChange,
  disabled = false,
  openAiConfigured = false,
  aiProductContext,
  onAiError,
}: ProductSystemRequirementsEditorProps) {
  const [addError, setAddError] = useState<string | null>(null);
  const aiContext = aiProductContext ?? {
    name: "Producto",
    platform: "—",
  };

  function updateItem(
    clientId: string,
    patch: Partial<Pick<SystemRequirementItem, "system" | "requirement">>,
  ) {
    onChange(
      items.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeItem(clientId: string) {
    onChange(items.filter((item) => item.clientId !== clientId));
  }

  function addBlock() {
    if (items.length >= MAX_BLOCKS) {
      setAddError(`Máximo ${MAX_BLOCKS} bloques de requisitos.`);
      return;
    }
    setAddError(null);
    onChange([...items, emptyBlock()]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Requisitos del sistema</p>
        <div className="flex flex-wrap items-center gap-2">
          <AiSystemRequirementsToolbar
            configured={openAiConfigured}
            productContext={aiContext}
            currentBlocks={blocksForAi(items)}
            onApply={(blocks) => onChange(mapAiBlocksToItems(blocks))}
            onError={onAiError}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || items.length >= MAX_BLOCKS}
            onClick={addBlock}
          >
            <IconPlus className="size-4" />
            Añadir sistema
          </Button>
        </div>
      </div>
      <FieldDescription>
        Un bloque por plataforma (Windows, Mac, Linux, etc.). Escribe un
        requisito por línea. Usa la IA para generar o traducir todos los
        bloques, o por bloque en cada tarjeta.
      </FieldDescription>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Sin requisitos. Importa desde Kinguin o añade un bloque manualmente.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.clientId}
              className="space-y-3 rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`sys-${item.clientId}`}>
                    Sistema
                  </FieldLabel>
                  <Input
                    id={`sys-${item.clientId}`}
                    value={item.system}
                    onChange={(e) =>
                      updateItem(item.clientId, { system: e.target.value })
                    }
                    disabled={disabled}
                    placeholder="Windows"
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                  onClick={() => removeItem(item.clientId)}
                  aria-label="Eliminar bloque"
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
              <Field>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLabel htmlFor={`req-${item.clientId}`} className="mb-0">
                    Requisitos (uno por línea)
                  </FieldLabel>
                  <AiSystemRequirementBlockToolbar
                    configured={openAiConfigured}
                    productContext={aiContext}
                    systemName={item.system}
                    requirementLines={requirementsToText(item.requirement)}
                    onApply={(text) =>
                      updateItem(item.clientId, {
                        requirement: textToRequirements(text),
                      })
                    }
                    onError={onAiError}
                    disabled={disabled}
                  />
                </div>
                <Textarea
                  id={`req-${item.clientId}`}
                  value={requirementsToText(item.requirement)}
                  onChange={(e) =>
                    updateItem(item.clientId, {
                      requirement: textToRequirements(e.target.value),
                    })
                  }
                  disabled={disabled}
                  rows={6}
                  className="text-sm"
                  placeholder={
                    "OS: Windows 10 64-bit\nProcessor: Intel i5\nMemory: 8 GB RAM"
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      )}

      {addError ? <p className="text-xs text-destructive">{addError}</p> : null}
    </div>
  );
}
