import * as fs from "fs";
import * as path from "path";
import * as EPub from "epub";
import { JSDOM } from "jsdom";

class EpubParser {
  private epub: EPub;

  constructor(epubPath: string) {
    this.epub = new EPub(epubPath);
  }

  async parse(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.epub.on("end", () => {
        this.extractText().then(resolve).catch(reject);
      });

      this.epub.on("error", reject);

      this.epub.parse();
    });
  }

  private async extractText(): Promise<string> {
    const chapters = await this.getChapters();
    const textContent = chapters.map(this.chapterToText).join("\n\n");
    return textContent;
  }

  private getChapters(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.epub.flow.forEach((chapter: any) => {
        this.epub.getChapter(
          chapter.id,
          (error: Error | null, text: string) => {
            if (error) {
              reject(error);
            } else {
              resolve([text]);
            }
          },
        );
      });
    });
  }

  private chapterToText(chapterHtml: string): string {
    const dom = new JSDOM(chapterHtml);
    return dom.window.document.body.textContent || "";
  }
}

// Usage
async function main() {
  const epubPath = path.join(__dirname, "path/to/your/book.epub");
  const parser = new EpubParser(epubPath);

  try {
    const text = await parser.parse();
    console.log(text);
  } catch (error) {
    console.error("Error parsing EPUB:", error);
  }
}

main();
