import uniq from "lodash.uniq";
import config from "../config";
import getChromeDB from "./db/chroma";
import BM25 from "./retrieve/BM25";

export async function retrieve(query: string) {
  const chroma = await getChromeDB();
  const [embeddingResults, bm25Results] = await Promise.all([
    chroma.queryByEmbeddings(query),
    chroma.queryByBM25(query),
  ]);

  console.log("Embedding Results Found", embeddingResults.documents.length);

  const topRankedResults = bm25Results.slice(0, config.bm25ResultsCutoff);

  const rankedEmbeddingResults = BM25.create(
    embeddingResults.documents.filter((doc) => doc != null),
  ).search(query, config.semanticSearchWeight);

  // rerank those based on the threshold
  // return those final ones

  console.log("BM25 Results Found", topRankedResults.length);

  const finalResults = uniq([
    ...rankedEmbeddingResults.map(({ doc }) => doc),
    ...topRankedResults.map(({ doc }) => doc),
  ]).slice(0, config.topK);

  console.info("All Results", finalResults.length);

  return finalResults;
}
