# A Pattern Language - Contextual Retrieval Experiment (October 10, 2024)

Let's implement Anthropic's new [Contextual Retrival technique](https://www.anthropic.com/news/contextual-retrieval) using A Pattern Language by Christopher Alexander as the source corpus.

```mermaid
---
title: Contextual Retrieval
---
flowchart LR
    subgraph Retrieve[Retrieval]
    F{Search For X Term} --> G[X Term Turned into Embeddings]
    G --> H[Run Embeddings Search]
    G --> I[Run BM25 Search]
    I --> I1[Run Weighted BM25 on All Results]
    H --> I1
    I1 --> I2[Combine Results & Dedupe]

    I2 --> J[topk results]

    J --> J1[Reranking Model]
    J1 --> K[Docs for AI Context]
    style F fill:#666,stroke:#333,stroke-width:4px
    style G fill:#666,stroke:#333,stroke-width:4px
    style H fill:#666,stroke:#333,stroke-width:4px
    style I fill:#666,stroke:#333,stroke-width:4px
    style I1 fill:#666,stroke:#333,stroke-width:4px
    style I2 fill:#666,stroke:#333,stroke-width:4px
    style J fill:#666,stroke:#333,stroke-width:4px
    style K fill:#666,stroke:#333,stroke-width:4px
    end

    subgraph Gen[Generate Context]
    A[Generate Corpus] --> B[Markdown Doc Set]
    B --> C[Generate Context Block For Chunk]
    C --> D[Create Embeddings from Text]
    D --> D1[Store in Vector DB]
    C --> E[Create BM25 Encodings of Doc]
    style A fill:#666,stroke:#333,stroke-width:4px
    style B fill:#666,stroke:#333,stroke-width:4px
    style C fill:#666,stroke:#333,stroke-width:4px
    style D fill:#666,stroke:#333,stroke-width:4px
    style D1 fill:#666,stroke:#333,stroke-width:4px
    style E fill:#666,stroke:#333,stroke-width:4px
    end
```

## Decisions
Q: How to define chunks
A: We'll do a chunk per chapter (per "word" in the language)

## What are the ways we could chunk documents?

- Brute Force
  - Split on every X character
- Smart Brute Force
  - Rules based split
    - Split on every X character, but only after a period
  - tokenizer you could use that then lets you split intelligently
- -> Document Structure Split
  - Every X pages
  - Everytime I see an H1
- -> Semantic Split
  - Something about the document has meaning that makes you want to split on it

My attempt is to use split on H1 (# symbol)
- This should indicate a new chapter
- Since I want each chunk to be a "word" from A Pattern Language, and each word is a chapter, this would also carry some semantic meaning
