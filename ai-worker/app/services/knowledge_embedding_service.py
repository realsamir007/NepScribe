import json

from sqlalchemy import text

from app.database import engine
from app.services.embedding_service import generate_embeddings
from app.services.knowledge_service import (
    load_knowledge_documents,
    split_knowledge_documents,
)


def store_knowledge_embeddings():
    documents = load_knowledge_documents()
    chunks = split_knowledge_documents(documents)

    if not chunks:
        print("No knowledge chunks found.")
        return 0

    texts = [
        chunk.page_content
        for chunk in chunks
    ]

    embeddings = generate_embeddings(texts)

    with engine.begin() as connection:
        for chunk, embedding in zip(chunks, embeddings):
            connection.execute(
                text(
                    """
                    INSERT INTO knowledge_documents (
                        content,
                        source,
                        category,
                        metadata,
                        embedding
                    )
                    VALUES (
                        :content,
                        :source,
                        :category,
                        CAST(:metadata AS JSONB),
                        CAST(:embedding AS vector)
                    )
                    """
                ),
                {
                    "content": chunk.page_content,
                    "source": chunk.metadata["source"],
                    "category": chunk.metadata["category"],
                    "metadata": json.dumps(chunk.metadata),
                    "embedding": str(embedding),
                },
            )

    print(
        f"Stored {len(chunks)} knowledge chunks "
        "with embeddings."
    )

    return len(chunks)