import re

from app.schemas.soap_schema import SOAPNote
from app.services.embedding_service import generate_embeddings


SOAP_SECTIONS = [
    "subjective",
    "objective",
    "assessment",
    "plan",
]

ALLOWED_META_STATEMENTS = [
    "no clinical assessment was documented",
    "vital signs are not documented",
    "no vital signs were documented",
    "not documented",
    "not provided",
    "not specified",
]


def split_into_sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def calculate_similarity(
    generated_sentence: str,
    transcript_sentences: list[str],
) -> float:

    if not transcript_sentences:
        return 0.0

    embeddings = generate_embeddings(
        [generated_sentence] + transcript_sentences
    )

    generated_embedding = embeddings[0]
    transcript_embeddings = embeddings[1:]

    similarities = [
        sum(
            generated_value * transcript_value
            for generated_value, transcript_value
            in zip(
                generated_embedding,
                transcript_embedding,
            )
        )
        for transcript_embedding in transcript_embeddings
    ]

    return max(similarities)


def is_allowed_meta_statement(sentence: str) -> bool:
    normalized = sentence.lower().strip()

    return any(
        statement in normalized
        for statement in ALLOWED_META_STATEMENTS
    )


# -------------------------------------------------------------
# High-risk clinical claim detection
# -------------------------------------------------------------

def contains_vital_sign_claim(text: str) -> bool:

    patterns = [
        r"\bblood pressure\b",
        r"\bbp\b",
        r"\bheart rate\b",
        r"\bpulse\b",
        r"\brespiratory rate\b",
        r"\btemperature\b",
        r"\boxygen saturation\b",
        r"\bspo2\b",
    ]

    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def contains_numeric_vital_sign(text: str) -> bool:

    patterns = [
        r"\b\d{2,3}/\d{2,3}\b",          # 120/80
        r"\bheart rate\b.*?\b\d{2,3}\b",
        r"\bpulse\b.*?\b\d{2,3}\b",
        r"\btemperature\b.*?\b\d{2,3}(?:\.\d+)?\b",
        r"\bspo2\b.*?\b\d{2,3}%?\b",
        r"\boxygen saturation\b.*?\b\d{2,3}%?\b",
    ]

    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def contains_medication_claim(text: str) -> bool:

    patterns = [
        r"\bantibiotic\b",
        r"\bmedication\b",
        r"\bprescribe\b",
        r"\bprescribed\b",
        r"\btablet\b",
        r"\bcapsule\b",
        r"\bdose\b",
        r"\bdosage\b",
        r"\bmg\b",
        r"\bmcg\b",
        r"\bml\b",
    ]

    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def contains_investigation_claim(text: str) -> bool:

    patterns = [
        r"\bx-ray\b",
        r"\bct scan\b",
        r"\bmri\b",
        r"\bultrasound\b",
        r"\bblood test\b",
        r"\blab test\b",
        r"\blaboratory test\b",
        r"\binvestigation\b",
        r"\bimaging\b",
    ]

    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def contains_diagnostic_claim(text: str) -> bool:

    patterns = [
        r"\bdiagnosed\b",
        r"\bdiagnosis\b",
        r"\bclinical diagnosis\b",
        r"\bclinical impression\b",
        r"\bpathology\b",
        r"\bdisease\b",
        r"\bcondition\b",
    ]

    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in patterns
    )


def validate_high_risk_claim(
    sentence: str,
    transcript: str,
) -> list[str]:

    warnings = []

    sentence_lower = sentence.lower()
    transcript_lower = transcript.lower()

    # Numeric vital signs
    if contains_numeric_vital_sign(sentence):
        if not contains_numeric_vital_sign(transcript):
            warnings.append(
                "Unsupported numeric vital-sign information "
                "was detected."
            )

    # General vital-sign claims
    elif contains_vital_sign_claim(sentence):
        if not contains_vital_sign_claim(transcript):
            warnings.append(
                "Unsupported vital-sign information "
                "was detected."
            )

    # Medication claims
    if contains_medication_claim(sentence):
        if not contains_medication_claim(transcript):
            warnings.append(
                "Unsupported medication information "
                "was detected."
            )

    # Investigation claims
    if contains_investigation_claim(sentence):
        if not contains_investigation_claim(transcript):
            warnings.append(
                "Unsupported investigation information "
                "was detected."
            )

    # Diagnostic claims
    if contains_diagnostic_claim(sentence):
        if not contains_diagnostic_claim(transcript):
            warnings.append(
                "Potentially unsupported diagnostic information "
                "was detected."
            )

    return warnings


def validate_soap_note(
    soap_note: SOAPNote,
    transcript: str,
    similarity_threshold: float = 0.55,
) -> dict:

    warnings = []
    flagged_sentences = []

    transcript_sentences = split_into_sentences(transcript)

    # ---------------------------------------------------------
    # 1. Check required SOAP sections
    # ---------------------------------------------------------

    for section in SOAP_SECTIONS:

        value = getattr(soap_note, section, "")

        if not value or not value.strip():
            warnings.append(
                f"{section.capitalize()} section is empty."
            )

    # ---------------------------------------------------------
    # 2. Validate each generated sentence
    # ---------------------------------------------------------

    for section in SOAP_SECTIONS:

        section_text = getattr(
            soap_note,
            section,
            "",
        ) or ""

        generated_sentences = split_into_sentences(
            section_text
        )

        for sentence in generated_sentences:

            if is_allowed_meta_statement(sentence):
                continue

            # ---------------------------------------------
            # High-risk claim validation
            # ---------------------------------------------

            high_risk_warnings = validate_high_risk_claim(
                sentence=sentence,
                transcript=transcript,
            )

            if high_risk_warnings:

                for warning in high_risk_warnings:
                    warnings.append(
                        f"{section.capitalize()}: {warning}"
                    )

                flagged_sentences.append(
                    {
                        "section": section,
                        "sentence": sentence,
                        "reason": "high_risk_claim",
                    }
                )

                continue

            # ---------------------------------------------
            # Semantic evidence validation
            # ---------------------------------------------

            similarity = calculate_similarity(
                generated_sentence=sentence,
                transcript_sentences=transcript_sentences,
            )

            if similarity < similarity_threshold:

                flagged_sentences.append(
                    {
                        "section": section,
                        "sentence": sentence,
                        "similarity": round(
                            similarity,
                            4,
                        ),
                        "reason": "low_transcript_similarity",
                    }
                )

                warnings.append(
                    f"Potentially unsupported statement in "
                    f"{section.capitalize()}: "
                    f"'{sentence}' "
                    f"(similarity={similarity:.4f})"
                )

    # ---------------------------------------------------------
    # 3. Final validation status
    # ---------------------------------------------------------

    if warnings:
        status = "flagged"
    else:
        status = "passed"

    return {
        "status": status,
        "warnings": warnings,
        "flagged_sentences": flagged_sentences,
        "is_valid": len(warnings) == 0,
    }