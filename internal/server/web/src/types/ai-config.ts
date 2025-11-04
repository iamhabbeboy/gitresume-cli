export interface LLmConfig {
  name: string;
  model?: string;
  api_key?: string;
  is_default: boolean;
}

export interface Prompt {
  role: string;
  content: string;
}

export interface AIConfig {
  models: Model[];
  custom_prompt: CustomPrompt[];
}

export interface Model {
  name: string;
  api_key: string;
  model: string;
  is_default: boolean;
  custom_prompt: Record<string, unknown>;
}

export interface CustomPrompt {
  title: string;
  model?: string;
  version?: string;
  temperature?: number;
  max_tokens?: number;
  prompts: Prompt[];
  api_key?: string;
}
