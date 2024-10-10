export default class BM25 {
  private documents: string[];
  private avgDocLength: number;
  private docFreq: Map<string, number>;
  private k1: number = 1.5;
  private b: number = 0.75;

  constructor(documents: string[]) {
    this.documents = documents;
    this.avgDocLength = this.calculateAvgDocLength();
    this.docFreq = this.calculateDocFreq();
  }

  private calculateAvgDocLength(): number {
    const totalLength = this.documents.reduce(
      (sum, doc) => sum + doc.split(" ").length,
      0,
    );
    return totalLength / this.documents.length;
  }

  private calculateDocFreq(): Map<string, number> {
    const docFreq = new Map<string, number>();
    this.documents.forEach((doc) => {
      const uniqueTerms = new Set(doc.toLowerCase().split(" "));
      uniqueTerms.forEach((term) => {
        docFreq.set(term, (docFreq.get(term) || 0) + 1);
      });
    });
    return docFreq;
  }

  private idf(term: string): number {
    const n = this.documents.length;
    const docFreq = this.docFreq.get(term) || 0;
    return Math.log((n - docFreq + 0.5) / (docFreq + 0.5) + 1);
  }

  private termFrequency(term: string, doc: string): number {
    const termCount = doc
      .toLowerCase()
      .split(" ")
      .filter((t) => t === term).length;
    return termCount / doc.split(" ").length;
  }

  public score(query: string, doc: string): number {
    const terms = query.toLowerCase().split(" ");
    const docLength = doc.split(" ").length;

    return terms.reduce((score, term) => {
      const tf = this.termFrequency(term, doc);
      const idf = this.idf(term);
      const numerator = tf * (this.k1 + 1);
      const denominator =
        tf + this.k1 * (1 - this.b + (this.b * docLength) / this.avgDocLength);
      return score + (idf * numerator) / denominator;
    }, 0);
  }

  public search(
    query: string,
    weight: number = 1,
  ): Array<{ doc: string; score: number }> {
    return this.documents
      .map((doc, _index) => ({
        doc,
        score: this.score(query, doc) * weight,
      }))
      .sort((a, b) => b.score - a.score);
  }

  static create(documents: string[]) {
    return new BM25(documents);
  }
}
