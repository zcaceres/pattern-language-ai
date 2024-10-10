import ollama from "ollama";
import fs from "fs";
import path from "path";
import type { DocWithContext } from "../../types";
import config from "../../config";
import getChromeDB from "../db/chroma";

export class EmbedText {
  private static async embed(text: string) {
    const { embeddings } = await ollama.embed({
      model: config.embeddingsModel,
      input: text,
    });
    return embeddings;
  }

  static async fromText(text: string) {
    return this.embed(text);
  }

  static async fromContextDocument(doc: DocWithContext) {
    return this.embed(`${doc.summary}

      ${doc.chunk}`);
  }
}

export async function generateEmbeddings() {
  const chroma = await getChromeDB();
  const contextDir = config.documentContextDir;
  const jsonFiles = fs
    .readdirSync(contextDir)
    .filter((file) => path.extname(file) === ".json");

  console.info("Generating embeddings");

  const docsWithEmbeddings = await Promise.all(
    jsonFiles.map(async (file) => {
      const filePath = path.join(contextDir, file);
      const jsonContent = fs.readFileSync(filePath, "utf8");
      const parsedJson: DocWithContext = JSON.parse(jsonContent);
      const embeddings = await EmbedText.fromContextDocument(
        parsedJson as DocWithContext,
      );

      return {
        document: parsedJson.document,
        summary: parsedJson.summary,
        chunk: parsedJson.chunk,
        embeddings,
      };
    }),
  );

  console.info("Writing embeddings to DB");

  for (const doc of docsWithEmbeddings) {
    chroma.addDocument({
      document: {
        summary: doc.summary,
        chunk: doc.chunk,
      },
      embeddings: doc.embeddings,
    });
  }
}
