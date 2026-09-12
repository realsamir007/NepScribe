from langchain_core.documents import Document

from app.services.retrieval_service import search_knowledge


def retrieve_knowledge(
    query: str,
    top_k: int = 3,
) -> list[Document]:
    results = search_knowledge(
        query=query,
        top_k=top_k,
    )

    documents = []

    for result in results:
        document = Document(
            page_content=result["content"],
            metadata={
                "source": result["source"],
                "category": result["category"],
                "similarity": result["similarity"],
            },
        )

        documents.append(document)

    return documents