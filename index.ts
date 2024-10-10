import { Command } from "commander";
import { chunkMarkdown } from "./src/generate/chunk-markdown";
import { generateDocuments } from "./src/generate/generate-documents";
import { generateEmbeddings } from "./src/generate/generate-embeddings";
import { preparePDF } from "./src/generate/prepare-pdf";
import { splitPDF } from "./src/generate/split-pdf";
import ContextGenerator from "./src/generate/generate-context";
import getChromeDB from "./src/db/chroma";

const program = new Command();

program
  .name("pattern-language-ai")
  .description("CLI for Pattern Language AI operations")
  .version("1.0.0");

program
  .command("chunk-markdown")
  .description("Chunk markdown files")
  .argument("<dirWithMarkdown>", "Directory containing markdown files")
  .action((dirWithMarkdown) => {
    chunkMarkdown(dirWithMarkdown);
  });

program
  .command("generate-documents")
  .description("Generate documents with context")
  .action(async () => {
    try {
      await generateDocuments();
      console.log("Documents generated successfully");
    } catch (error) {
      console.error("Error generating documents:", error);
    }
  });

program
  .command("generate-embeddings")
  .description("Generate embeddings for documents")
  .action(async () => {
    await generateEmbeddings();
    console.log("Generated embeddings");
  });

program
  .command("prepare-pdf")
  .description("Prepare PDF for processing")
  .argument("<sourceFilePath>", "Path to source PDF file")
  .argument("<outDir>", "Output directory")
  .option("-c, --chunks <number>", "Number of chunks", "1")
  .option("-w, --workers <number>", "Number of workers", "1")
  .action((sourceFilePath, outDir, options) => {
    preparePDF(sourceFilePath, outDir, {
      numChunks: parseInt(options.chunks),
      workers: parseInt(options.workers),
    });
  });

program
  .command("split-pdf")
  .description("Split PDF into chunks")
  .argument("<inputPath>", "Path to input PDF")
  .argument("<outputDir>", "Output directory for chunks")
  .option("-p, --pages-per-chunk <number>", "Pages per chunk", "100")
  .action((inputPath, outputDir, options) => {
    splitPDF(inputPath, outputDir, parseInt(options.pagesPerChunk));
  });

program
  .command("generate-context")
  .description("Generate context for a document chunk")
  .requiredOption("-d, --document <path>", "Path to document intro file")
  .requiredOption("-c, --chunk <path>", "Path to chunk file")
  .action(async (options) => {
    const documentContent = require("fs").readFileSync(
      options.document,
      "utf-8",
    );
    const chunkContent = require("fs").readFileSync(options.chunk, "utf-8");
    const result = await ContextGenerator.fromDocument({
      document: documentContent,
      chunk: chunkContent,
    });
    console.log("Generated context:", result);
  });

program
  .command("query")
  .description("Query the ChromaDB")
  .argument("<query...>", "Query string")
  .action(async (query: string[]) => {
    const chroma = await getChromeDB();
    const results = await chroma.query(query.join(" "));
    console.log("Query results:", results.documents[0].length);
  });

program.parse(process.argv);
