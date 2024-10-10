import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export async function splitPDF(
  inputPath: string,
  outputDir: string,
  pagesPerChunk: number = 100,
) {
  const pdfBytes = await fs.readFile(inputPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const totalPages = pdfDoc.getPageCount();

  const numberOfChunks = Math.ceil(totalPages / pagesPerChunk);

  for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
    const chunkDoc = await PDFDocument.create();

    const startPage = chunkIndex * pagesPerChunk;
    const endPage = Math.min((chunkIndex + 1) * pagesPerChunk, totalPages);

    const copiedPages = await chunkDoc.copyPages(
      pdfDoc,
      Array.from({ length: endPage - startPage }, (_, i) => startPage + i),
    );
    copiedPages.forEach((page) => chunkDoc.addPage(page));

    const pdfBytes = await chunkDoc.save();
    const outputPath = path.join(outputDir, `chunk_${chunkIndex + 1}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);

    console.log(`Saved chunk ${chunkIndex + 1} to ${outputPath}`);
  }

  console.log("PDF splitting complete!");
}
