import "server-only";

import OpenAI from "openai";
import { getOpenAIConfig } from "@/lib/openai/env";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const config = getOpenAIConfig();
  if (!config) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: config.apiKey });
  }

  return client;
}
