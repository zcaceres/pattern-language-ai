import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import type {
  ChunkSummary,
  ContextGenInput,
  DocWithContext,
} from "../../types";
import config from "../../config";

type ContextGenPrompt = {
  documentPrompt: string;
  chunkPrompt: string;
};

export default class ContextGenerator {
  private static formatPrompt(
    contextDocument: string,
    chunk: string,
  ): ContextGenPrompt {
    return {
      documentPrompt: `
    <document>
    ${contextDocument}
    </document>
    `,
      chunkPrompt: `Here is the chunk we want to situate within the whole document
    <chunk>
    ${chunk}
    </chunk>

    Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk.
    Answer only with the succinct context and nothing else.
      `,
    };
  }

  private static async sendToLLM(prompts: ContextGenPrompt) {
    const { text } = await generateText({
      model: anthropic(config.llmModel, {
        cacheControl: true,
      }),
      messages: [
        {
          role: "user",
          content: prompts.documentPrompt,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
        {
          role: "user",
          content: prompts.chunkPrompt,
        },
      ],
    });

    return text as ChunkSummary;
  }

  static async fromDocument(inputs: ContextGenInput): Promise<DocWithContext> {
    console.info("Generating context for chunk");
    const prompts = this.formatPrompt(inputs.document, inputs.chunk);

    const chunkSummary = await this.sendToLLM(prompts);

    console.info("Generated context for chunk");

    return {
      summary: chunkSummary,
      document: inputs.document,
      chunk: inputs.chunk,
    };
  }
}
