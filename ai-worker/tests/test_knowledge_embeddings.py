from app.services.knowledge.knowledge_embedding_service import (
    store_knowledge_embeddings,
)


count = store_knowledge_embeddings()

print(f"\nSuccessfully stored: {count} chunks")