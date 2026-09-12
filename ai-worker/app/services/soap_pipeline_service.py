from app.schemas.soap_schema import SOAPNote
from app.services.llm_service import generate_soap_note
from app.services.prompt_service import build_soap_prompt
from app.services.rag_service import build_rag_context
from app.services.soap_validation_service import validate_soap_note


def generate_and_validate_soap(
    transcript: str,
    top_k: int = 3,
) -> dict:
    """
    Generate a structured SOAP note using RAG and the local LLM,
    then validate the generated note against the source transcript.
    """

    # ---------------------------------------------------------
    # 1. Build RAG context
    # ---------------------------------------------------------

    rag_context = build_rag_context(
        transcript=transcript,
        top_k=top_k,
    )

    # ---------------------------------------------------------
    # 2. Build SOAP generation prompt
    # ---------------------------------------------------------

    prompt = build_soap_prompt(
        transcript=rag_context["transcript"],
        knowledge_context=rag_context["knowledge"],
    )

    # ---------------------------------------------------------
    # 3. Generate structured SOAP note
    # ---------------------------------------------------------

    soap_note: SOAPNote = generate_soap_note(prompt)

    # ---------------------------------------------------------
    # 4. Validate generated SOAP note
    # ---------------------------------------------------------

    validation = validate_soap_note(
        soap_note=soap_note,
        transcript=transcript,
    )

    # ---------------------------------------------------------
    # 5. Return complete pipeline result
    # ---------------------------------------------------------

    return {
        "soap_note": soap_note,
        "validation": validation,
        "rag_context": rag_context,
    }