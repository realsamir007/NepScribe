from app.services.llm_service import generate_soap_note
from app.services.prompt_service import build_soap_prompt
from app.services.rag_service import build_rag_context


transcript = """
The patient reports a cough that has continued for three weeks.
The patient says the cough is worse at night.

The doctor listens to the patient's chest and documents
no abnormal findings.

The doctor recommends follow-up if symptoms continue.
"""


rag_context = build_rag_context(
    transcript=transcript,
    top_k=3,
)


prompt = build_soap_prompt(
    transcript=rag_context["transcript"],
    knowledge_context=rag_context["knowledge"],
)


soap_note = generate_soap_note(prompt)


print("\n" + "=" * 70)
print("STRUCTURED SOAP GENERATION TEST")
print("=" * 70)

print("\nSUBJECTIVE:")
print(soap_note.subjective)

print("\nOBJECTIVE:")
print(soap_note.objective)

print("\nASSESSMENT:")
print(soap_note.assessment)

print("\nPLAN:")
print(soap_note.plan)