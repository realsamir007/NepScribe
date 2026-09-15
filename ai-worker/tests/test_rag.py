from app.services.rag.rag_service import build_rag_context
from app.services.rag.prompt_service import build_soap_prompt

transcript = """
The patient reports a cough that has continued for three weeks.
The patient says the cough is worse at night.
The doctor listens to the patient's chest and documents
no abnormal findings.
The doctor recommends follow-up if symptoms continue.
"""


result = build_rag_context(
    transcript=transcript,
    top_k=3,
)


print("\n" + "=" * 70)
print("RAG CONTEXT TEST")
print("=" * 70)

print("\nTRANSCRIPT:")
print(result["transcript"])

print("\nRETRIEVED KNOWLEDGE:")

for index, item in enumerate(
    result["knowledge"],
    start=1,
):
    print("\n" + "-" * 70)
    print(f"Knowledge {index}")
    print("-" * 70)
    print(f"Similarity: {item['similarity']:.4f}")
    print(f"Source: {item['source']}")
    print(f"Category: {item['category']}")
    print(f"Content:\n{item['content']}")
    



prompt = build_soap_prompt(
    transcript=result["transcript"],
    knowledge_context=result["knowledge"],
)


print("\n" + "=" * 70)
print("GENERATED SOAP PROMPT")
print("=" * 70)

print(prompt)