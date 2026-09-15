from sentence_transformers import SentenceTransformer


MODEL_NAME = "BAAI/bge-m3"

_model = None


def get_embedding_model():
    global _model

    if _model is None:
        print(f"Loading embedding model: {MODEL_NAME}")

        _model = SentenceTransformer(MODEL_NAME)

        print("Embedding model loaded.")

    return _model


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    model = get_embedding_model()

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
    )

    return embeddings.tolist()