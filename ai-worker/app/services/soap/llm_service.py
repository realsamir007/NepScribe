from langchain_ollama import ChatOllama

from app.schemas.soap_schema import SOAPNote


_model = None


def get_llm():
    global _model

    if _model is None:
        print("Initializing local Qwen3 1.7B model...")

        _model = ChatOllama(
            model="qwen3:1.7b",
            temperature=0,
        )

        print("Local Qwen3 1.7B model initialized.")

    return _model


def generate_response(prompt: str) -> str:
    llm = get_llm()

    response = llm.invoke(prompt)

    return response.content


def generate_soap_note(prompt: str) -> SOAPNote:
    llm = get_llm()

    structured_llm = llm.with_structured_output(
        SOAPNote
    )

    response = structured_llm.invoke(prompt)

    return response