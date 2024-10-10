import fs from "fs";
import path from "path";
import ContextGenerator from "./generate-context";
import config from "../../config";

export async function generateDocuments() {
  const markdownDirectory = "chunked-markdown";
  const documentIntro = fs.readFileSync("apl-intro.txt", "utf-8");
  const markdownFiles = fs
    .readdirSync(markdownDirectory)
    .filter((file) => file.endsWith(".md"));

  for (const file of markdownFiles) {
    const filePath = path.join(markdownDirectory, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const docWithContext = await ContextGenerator.fromDocument({
      document: documentIntro,
      chunk: content,
    });

    console.info("Writing file");
    const outFileName = `${file}.json`;

    fs.writeFileSync(
      path.join(config.documentContextDir, outFileName),
      JSON.stringify(docWithContext),
    );

    console.info("FILE SAVED - ", outFileName);

    console.info("Sleeping for 15 seconds");
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}
