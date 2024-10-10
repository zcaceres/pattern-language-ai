export default {
  llmModel: "claude-3-haiku-20240307",
  ollamaURL: "http://localhost:11434/api/embed",
  embeddingsModel: "mxbai-embed-large", // "llama3.2:3b",
  collectionName: "documents",
  documentContextDir: "doc-context-json",
  maxResults: 20,
  bm25ResultsCutoff: 20,
  topK: 20,
  semanticSearchWeight: 0.8,
  bm25Weight: 0.2,
};
