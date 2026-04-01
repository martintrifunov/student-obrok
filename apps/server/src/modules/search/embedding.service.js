import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 3072;

export class EmbeddingService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.client = null;
      return;
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  isAvailable() {
    return this.client !== null;
  }

  async generateEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {
    if (!this.client) throw new Error("GEMINI_API_KEY not configured.");
    return this.#embedWithRetry(text, taskType);
  }

  async #embedWithRetry(text, taskType, maxRetries = 5) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.client.models.embedContent({
          model: MODEL,
          contents: text,
          config: { taskType, outputDimensionality: DIMENSIONS },
        });
        return result.embeddings[0].values;
      } catch (err) {
        if (err.status === 429 && attempt < maxRetries) {
          const match = err.message?.match(/retry in ([\d.]+)s/i);
          const wait = match ? Math.ceil(Number(match[1])) * 1000 : (attempt + 1) * 15_000;
          console.log(`[Embedding] Rate limited, waiting ${Math.round(wait / 1000)}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw err;
      }
    }
  }

  async generateBatchEmbeddings(texts, taskType = "RETRIEVAL_DOCUMENT") {
    if (!this.client) throw new Error("GEMINI_API_KEY not configured.");

    const results = [];
    for (let i = 0; i < texts.length; i += 10) {
      const batch = texts.slice(i, i + 10);
      const embeddings = await Promise.all(
        batch.map((text) => this.#embedWithRetry(text, taskType)),
      );

      results.push(...embeddings);

      // Stay under 100 req/min free-tier limit
      await new Promise((r) => setTimeout(r, 6_000));
    }

    return results;
  }
}
