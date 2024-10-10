export type ContextGenInput = {
  document: string;
  chunk: string;
};

export type DocWithContext = {
  document: string;
  chunk: string;
  summary: string;
};

type Distinct<T, DistinctName> = T & { __TYPE__: DistinctName };
export type ChunkSummary = Distinct<string, "ChunkSummary">;
