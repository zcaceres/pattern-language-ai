import { execSync } from "child_process";
import path from "path";
import { splitPDF } from "./split-pdf";
import { chunkMarkdown } from "./chunk-markdown";

export function preparePDF(
  sourceFilePath: string,
  outDir: string,
  markdownConfig: {
    numChunks: number;
    workers: number;
  } = {
    numChunks: 1,
    workers: 1,
  },
) {
  const ocrdFilePath = path.join(
    outDir,
    "ocr_" + path.basename(sourceFilePath),
  );
  execSync(`ocrmypdf "${sourceFilePath}" "${ocrdFilePath}"`);

  const tmpDir = path.join(outDir, "chunks");

  splitPDF(ocrdFilePath, tmpDir);

  execSync(
    `marker ${tmpDir} ${outDir} --num_chunks ${markdownConfig.numChunks} --workers ${markdownConfig.workers}`,
  );

  chunkMarkdown(outDir);

  console.info("DONE!");
}
