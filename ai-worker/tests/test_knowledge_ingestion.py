from app.services.knowledge.knowledge_service import (
    load_knowledge_documents,
    split_knowledge_documents,
)


documents = load_knowledge_documents()

print("\nLoaded documents:")
print("-----------------")

for document in documents:
    print(
        f"Source: {document.metadata['source']}"
    )

    print(
        f"Category: {document.metadata['category']}"
    )

    print(
        f"Characters: {len(document.page_content)}"
    )

    print()


chunks = split_knowledge_documents(documents)

print("Chunks:")
print("-------")

for index, chunk in enumerate(chunks):
    print(
        f"\nChunk {index + 1}"
    )

    print(
        f"Source: "
        f"{chunk.metadata['source']}"
    )

    print(
        f"Characters: "
        f"{len(chunk.page_content)}"
    )

    print(
        f"Content:\n{chunk.page_content}"
    )

print(
    f"\nTotal documents: {len(documents)}"
)

print(
    f"Total chunks: {len(chunks)}"
)