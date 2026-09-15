from app.services.knowledge.retriever_service import retrieve_knowledge


def build_rag_context(
    transcript: str,
    top_k: int = 3,
) -> dict:
    retrieved_documents = retrieve_knowledge(
        query=transcript,
        top_k=top_k,
    )

    knowledge_context = []

    for document in retrieved_documents:
        knowledge_context.append(
            {
                "content": document.page_content,
                "source": document.metadata["source"],
                "category": document.metadata["category"],
                "similarity": document.metadata["similarity"],
            }
        )

    return {
        "transcript": transcript,
        "knowledge": knowledge_context,
    }