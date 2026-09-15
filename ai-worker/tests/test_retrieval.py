from app.services.knowledge.retrieval_service import search_knowledge


queries = [
    "What information belongs in the subjective section?",
    "What should be included in the plan section?",
    "How should objective findings be documented?",
]


for query in queries:
    print("\n" + "=" * 70)
    print(f"QUERY: {query}")
    print("=" * 70)

    results = search_knowledge(query, top_k=2)

    for index, result in enumerate(results, start=1):
        print(f"\nResult {index}")
        print(f"Similarity: {result['similarity']:.4f}")
        print(f"Source: {result['source']}")
        print(f"Category: {result['category']}")
        print(f"Content:\n{result['content']}")