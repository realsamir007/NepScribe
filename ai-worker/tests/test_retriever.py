from app.services.knowledge.retriever_service import retrieve_knowledge


query = (
    "The patient reports a cough for three weeks. "
    "What information should be included in the "
    "Subjective section?"
)

documents = retrieve_knowledge(
    query=query,
    top_k=2,
)

print("\n" + "=" * 70)
print("LANGCHAIN RETRIEVER TEST")
print("=" * 70)

print(f"\nQuery:\n{query}")

print(f"\nRetrieved documents: {len(documents)}")

for index, document in enumerate(documents, start=1):
    print("\n" + "-" * 70)
    print(f"Document {index}")
    print("-" * 70)

    print(f"Source: {document.metadata['source']}")
    print(f"Category: {document.metadata['category']}")
    print(
        f"Similarity: "
        f"{document.metadata['similarity']:.4f}"
    )

    print("\nContent:")
    print(document.page_content)