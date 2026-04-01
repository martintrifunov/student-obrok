import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;

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

    const result = await this.client.models.embedContent({
      model: MODEL,
      contents: text,
      config: { taskType, outputDimensionality: DIMENSIONS },
    });

    return result.embeddings[0].values;
  }

  async generateBatchEmbeddings(texts, taskType = "RETRIEVAL_DOCUMENT") {
    if (!this.client) throw new Error("GEMINI_API_KEY not configured.");

    const results = [];
    // Gemini batch size limit: process in chunks of 100
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100);
      const requests = batch.map((text) => ({
        model: MODEL,
        contents: text,
        config: { taskType, outputDimensionality: DIMENSIONS },
      }));

      const response = await this.client.models.batchEmbedContents({
        model: MODEL,
        requests,
      });

      results.push(...response.embeddings.map((e) => e.values));

      // Rate-limit courtesy delay between batches
      if (i + 100 < texts.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return results;
  }
}
