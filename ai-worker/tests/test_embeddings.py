from app.services.knowledge.embedding_service import generate_embeddings


texts = [
    "The patient reports a persistent cough.",
    "The patient has had a cough for three weeks.",
    "The patient reports abdominal pain.",
]


embeddings = generate_embeddings(texts)


print("\nEmbedding test")
print("--------------")

print(f"Number of embeddings: {len(embeddings)}")

for index, embedding in enumerate(embeddings):
    print(
        f"Text {index + 1}: "
        f"{len(embedding)} dimensions"
    )

print("\nFirst 10 values of the first embedding:")
print(embeddings[0][:10])