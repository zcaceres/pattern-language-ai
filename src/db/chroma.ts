import { ChromaClient, type IDs, type Document } from "chromadb";
import { v4 as uuidv4 } from "uuid";
import config from "../../config";
import { EmbedText } from "../generate/generate-embeddings";
import BM25 from "../retrieve/BM25";

type ChromaCollection = Awaited<ReturnType<ChromaClient["createCollection"]>>;

export type DocumentQueryResult = {
  ids: IDs;
  documents: (Document | null)[];
};

class ChromaDB {
  client: ChromaClient;
  collection: ChromaCollection;

  private constructor({
    client,
    collection,
  }: {
    client: ChromaClient;
    collection: ChromaCollection;
  }) {
    this.client = client;
    this.collection = collection;
  }

  private static async createCollection(
    client: ChromaClient,
    collectionName: string = config.collectionName,
  ) {
    return await client.getOrCreateCollection({
      name: collectionName,
    });
  }

  async addDocument(input: {
    document: {
      summary: string;
      chunk: string;
    };
    embeddings: number[][];
  }) {
    await this.collection.add({
      ids: [uuidv4()],
      embeddings: input.embeddings,
      documents: [
        `
        ${input.document.summary}

        ${input.document.chunk}
        `,
      ],
    });
  }

  async queryByBM25(query: string): Promise<{ doc: string; score: number }[]> {
    const allDocuments = await this.getAllDocuments();
    const bm25 = BM25.create(
      allDocuments.documents.filter((doc) => doc != null),
    );
    return bm25.search(query, config.bm25Weight);
  }

  private async getAllDocuments(): Promise<DocumentQueryResult> {
    const results = await this.collection.get();

    return {
      ids: results.ids,
      documents: results.documents,
    };
  }

  async queryByEmbeddings(query: string): Promise<DocumentQueryResult> {
    console.info("Querying for", query);
    const embeddings = await EmbedText.fromText(query);
    const results = await this.collection.query({
      queryEmbeddings: embeddings,
      nResults: config.maxResults,
    });

    const [ids] = results.ids;
    const [documents] = results.documents;

    return {
      ids,
      documents,
    };
  }

  static async create() {
    const client = new ChromaClient();

    const collection = await ChromaDB.createCollection(client);
    return new ChromaDB({ client, collection });
  }
}

let globalChromaDB: ChromaDB | null = null;

export default async function getChromeDB() {
  if (globalChromaDB) {
    return globalChromaDB;
  }
  globalChromaDB = await ChromaDB.create();
  return globalChromaDB;
}
