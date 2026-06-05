export type AiTextTask =
  | "improve"
  | "generate"
  | "translate"
  | "shorten"
  | "expand";

export type AiTextField =
  | "name"
  | "description"
  | "categoryDescription"
  | "activationDetails"
  | "regionalLimitations"
  | "systemRequirementLines";

export type AiCategoryContext = {
  name: string;
  slug?: string | null;
  productCount?: number;
};

export type AiProductContext = {
  name: string;
  platform: string;
  originalName?: string | null;
  regionalLimitations?: string | null;
  developers?: string[];
  publishers?: string[];
  languages?: string[];
  isPreorder?: boolean;
};

export type AiTextAssistInput = {
  task: AiTextTask;
  field: AiTextField;
  currentText: string;
  userPrompt?: string;
  productContext?: AiProductContext;
  categoryContext?: AiCategoryContext;
};

export type AiTextAssistResult =
  | { success: true; text: string }
  | { success: false; error: string };

export type AiSystemRequirementBlock = {
  system: string;
  requirement: string[];
};

export type AiSystemRequirementsAssistInput = {
  task: AiTextTask;
  productContext: AiProductContext;
  currentBlocks: AiSystemRequirementBlock[];
};

export type AiSystemRequirementBlockAssistInput = {
  task: AiTextTask;
  productContext: AiProductContext;
  systemName: string;
  requirementLines: string;
};

export type AiSystemRequirementsAssistResult =
  | { success: true; requirements: AiSystemRequirementBlock[] }
  | { success: false; error: string };

export const AI_TEXT_TASK_LABELS: Record<
  AiTextTask,
  { label: string; description: string }
> = {
  improve: {
    label: "Mejorar",
    description: "Pulir redacción para la tienda chilena",
  },
  generate: {
    label: "Generar",
    description: "Redactar desde el contexto del producto",
  },
  translate: {
    label: "Traducir",
    description: "Español de Chile",
  },
  shorten: {
    label: "Resumir",
    description: "Versión más corta",
  },
  expand: {
    label: "Ampliar",
    description: "Más detalle para el comprador",
  },
};
