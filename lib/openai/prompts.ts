import type {
  AiProductContext,
  AiTextField,
  AiTextTask,
} from "@/lib/admin/ai/types";
import {
  formatProductContext,
  STORE_CONTEXT,
} from "@/lib/openai/prompts-shared";

function fieldLabel(field: AiTextField): string {
  switch (field) {
    case "name":
      return "nombre del producto en la tienda";
    case "description":
      return "descripción del producto para la ficha de la tienda (formato HTML simple)";
    case "activationDetails":
      return "instrucciones de activación de la key";
    case "regionalLimitations":
      return "etiqueta corta de región/limitaciones";
    case "systemRequirementLines":
      return "lista de requisitos técnicos del sistema (una línea por requisito)";
    default:
      return "texto del producto";
  }
}

function taskInstruction(task: AiTextTask, field: AiTextField): string {
  const label = fieldLabel(field);

  switch (task) {
    case "improve":
      return `Mejora el ${label} para publicarlo en la tienda: más claro, persuasivo y orientado al comprador chileno. Conserva datos factuales del texto actual.`;
    case "generate":
      return `Redacta un ${label} nuevo para la ficha del producto, usando el contexto proporcionado. Si hay texto de referencia, úsalo como base sin copiarlo literalmente.`;
    case "translate":
      return `Traduce al español de Chile el ${label}. Si ya está en español, adapta el tono chileno y corrige redacción.`;
    case "shorten":
      return `Resume el ${label} manteniendo la información esencial para el comprador chileno.`;
    case "expand":
      return `Amplía el ${label} con más detalle útil para el comprador chileno, sin relleno ni repetición.`;
    default:
      return `Edita el ${label} para la tienda chilena.`;
  }
}

export function buildAiTextMessages(
  task: AiTextTask,
  field: AiTextField,
  currentText: string,
  productContext: AiProductContext,
): { system: string; user: string } {
  const trimmed = currentText.trim();
  const userParts = [
    taskInstruction(task, field),
    "",
    "Contexto del producto:",
    formatProductContext(productContext),
  ];

  if (trimmed) {
    userParts.push("", "Texto actual:", trimmed);
  } else {
    userParts.push("", "Texto actual: (vacío)");
  }

  return {
    system: STORE_CONTEXT,
    user: userParts.join("\n"),
  };
}
