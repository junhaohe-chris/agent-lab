import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

export const model = process.env.DEEPSEEK_MODEL!;