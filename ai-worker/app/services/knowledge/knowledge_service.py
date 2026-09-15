from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


KNOWLEDGE_ROOT = (
    Path(__file__).resolve().parents[3]
    / "knowledge"
)


def load_knowledge_documents() -> list[Document]:
    """
    Load knowledge-base text files into LangChain Documents.
    """

    documents = []

    for file_path in KNOWLEDGE_ROOT.rglob("*.txt"):

        relative_path = file_path.relative_to(
            KNOWLEDGE_ROOT
        )

        category = relative_path.parts[0]

        text = file_path.read_text(
            encoding="utf-8"
        )

        document = Document(
            page_content=text,
            metadata={
                "source": str(relative_path),
                "category": category,
            },
        )

        documents.append(document)

    return documents


def split_knowledge_documents(
    documents: list[Document],
) -> list[Document]:
    """
    Split knowledge documents into smaller chunks.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )

    return splitter.split_documents(documents)