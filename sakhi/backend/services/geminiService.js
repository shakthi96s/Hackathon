import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt.js';

let ai;

export async function getGeminiResponse(conversation, message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    ai ||= new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `Conversation:\n${JSON.stringify(conversation)}\n\nUser:\n${message}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 250,
      },
    });
    const output = response.text?.trim();
    if (!output) return null;
    const parsed = JSON.parse(output);
    if (
      typeof parsed.reply !== 'string' ||
      typeof parsed.intent !== 'string' ||
      !parsed.extractedData ||
      typeof parsed.extractedData !== 'object' ||
      Array.isArray(parsed.extractedData) ||
      typeof parsed.nextQuestion !== 'string'
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}