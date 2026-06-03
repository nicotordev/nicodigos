export type OpenAIConfig = {
  apiKey: string;
  model: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

export function isOpenAIConfigured(): boolean {
  return getOpenAIConfig() !== null;
}

export function getOpenAIConfig(): OpenAIConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: getOpenAIModel(),
  };
}
