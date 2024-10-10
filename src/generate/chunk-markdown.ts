import fs from "fs";
import path from "path";

export function chunkMarkdown(dirWithMarkdown: string) {
  const markdownFiles = fs
    .readdirSync(dirWithMarkdown)
    .filter((file) => file.endsWith(".md"));

  markdownFiles.forEach((file) => {
    const filePath = path.join(dirWithMarkdown, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const sections = content.split(/(?=^# )/m);

    sections.forEach((section, index) => {
      const sectionFileName = `${path.parse(file).name}_section${index + 1}.md`;
      const sectionFilePath = path.join("chunked-markdown", sectionFileName);
      fs.writeFileSync(sectionFilePath, section.trim());
    });
  });
}

chunkMarkdown("markdown/chunk_2");
