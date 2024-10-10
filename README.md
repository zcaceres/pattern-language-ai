# A Pattern Language - Contextual Retrieval Experiment (October 7, 2024)

Problem: `A Pattern Language` by Christopher Alexander is huge (1,200+ pages). To retrieve from it, we'll need some smart way to get stuff into context.

Solution: Let's implement Anthropic's new [Contextual Retrival technique](https://www.anthropic.com/news/contextual-retrieval) using A Pattern Language by Christopher Alexander as the source data.

Relevant Page Range: 10 - 1,166

Our definition of document is:
- The introduction to the book, which situates the language as to its use

Our definition of "chunk" is:
- A specific chapter in the book, which is a "word" in the language

// 1200 page PDF (not OCR'd)
// OCR
// markdown it
// Split on "#" symbol <-- H1s are chapters
// Each chapter is a document of a "word in the language"
// Set of words that I summarize and retrieve


## Decisions
Q: How to define chunks
A: We'll do a chunk per chapter (per "word" in the language)


Q: Which models to use to generate embeddings?
    - We found Gemini and Voyage embeddings to be particularly effective.
A:

Q: How many chunks get retrieved and included in the model's context
A: Seems like more is better. Anthropic recommends 20.

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




## Generate Corpus

- [X] Get the PDF
- [X] OCR the PDF
- [] Converting PDF to Markdown (series of markdown docs for each chapter)


## Summarize Chunks of Content

Generate a summary by Claude.

```
<document>
{{WHOLE_DOCUMENT}}
</document>
Here is the chunk we want to situate within the whole document
<chunk>
{{CHUNK_CONTENT}}
</chunk>
Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else.
```

- 50-100 tokens
- prepended to the chunk before embedding it and before creating the BM25 index

## Encoding Step

We're using local Llama3.2:3b to generate text encodings for our documents.

We're using ChromaDB to store the embeddings.

Why is this interesting?
When I query for a document, we're going to be able to query ChromaDB for that search term.

Our search term becomes embeddings (meaning it becomes the vectors (arrays of numbers)) that represent multi-dimensional representation of the text. This means we can retrieve chunks that are "close" to the search term in the multi-dimensional space.




- TF-IDF encodings
  - old-school NLP stuff
- semantic embeddings
  - this appears to be the thing that most people mean when they say "embeddings/vector search"

```
from sklearn.feature_extraction.text import TfidfVectorizer
# Assume there are n documents each with some text. Corpus is a list that holds the text from each of these documents.The Vectorizer will generate a matrix similar to the one above.
corpus = [
    Document 1 Text,
    Document 2 Text,
    Document 3 Text,
    ....
    Document n Text
]
vectorizer = TfidfVectorizer()
```


## BM25 Index

This operated on the TF-IDF encodings of the chunks.

This is the part of the system that supports directly querying for content.




## Stretch Goal: Reranking model to optimize retrieval
https://cohere.com/rerank

How to convert such a big PDF to smaller documents?
1. Gemini 1.5 Pro (huge context window)
2. Splitting the PDF manually (probably with some tool)
3. Convert everything to MD... then split when we see a "header"

--


function validateEmail(email: UnvalidatedEmail) {
    // validate this email
    return email as ValidatedEmail;
}

function emailUser(email: ValidatedEmail) {
    // send email
}
