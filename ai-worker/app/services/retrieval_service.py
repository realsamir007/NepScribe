from sqlalchemy import text

from app.database import engine
from app.services.embedding_service import generate_embeddings


def search_knowledge(
    query: str,
    top_k: int = 3,
) -> list[dict]:
    query_embedding = generate_embeddings([query])[0]

    with engine.connect() as connection:
        result = connection.execute(
            text(
                """
                SELECT
                    id,
                    content,
                    source,
                    category,
                    1 - (
                        embedding
                        <=>
                        CAST(:query_embedding AS vector)
                    ) AS similarity
                FROM knowledge_documents
                ORDER BY embedding
                    <=>
                    CAST(:query_embedding AS vector)
                LIMIT :top_k
                """
            ),
            {
                "query_embedding": str(query_embedding),
                "top_k": top_k,
            },
        )

        rows = result.fetchall()

    return [
        {
            "id": str(row.id),
            "content": row.content,
            "source": row.source,
            "category": row.category,
            "similarity": float(row.similarity),
        }
        for row in rows
    ]