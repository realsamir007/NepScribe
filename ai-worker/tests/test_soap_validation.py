from app.schemas.soap_schema import SOAPNote
from app.services.soap.soap_validation_service import validate_soap_note


transcript = """
The patient reports a cough that has continued for three weeks.
The patient says the cough is worse at night.

The doctor listens to the patient's chest and documents
no abnormal findings.

The doctor recommends follow-up if symptoms continue.
"""


valid_soap = SOAPNote(
    subjective=(
        "The patient reports a cough that has continued for "
        "three weeks. The cough is worse at night."
    ),
    objective=(
        "The doctor listens to the patient's chest and "
        "documents no abnormal findings. "
        "Vital signs are not documented."
    ),
    assessment="No clinical assessment was documented.",
    plan="Follow-up if symptoms continue.",
)


result = validate_soap_note(
    soap_note=valid_soap,
    transcript=transcript,
)


print("\n" + "=" * 70)
print("VALID SOAP VALIDATION TEST")
print("=" * 70)

print("\nStatus:")
print(result["status"])

print("\nWarnings:")

if result["warnings"]:
    for warning in result["warnings"]:
        print(f"- {warning}")
else:
    print("No warnings.")

print("\nFlagged sentences:")

if result["flagged_sentences"]:
    for item in result["flagged_sentences"]:
        print(
            f"- [{item['section']}] "
            f"{item['sentence']} "
            f"(similarity={item['similarity']})"
        )
else:
    print("None.")

print("\nIs valid:")
print(result["is_valid"])


# -------------------------------------------------------------
# Intentionally hallucinated SOAP note
# -------------------------------------------------------------

invalid_soap = SOAPNote(
    subjective=(
        "The patient reports a cough that has continued for "
        "three weeks."
    ),
    objective=(
        "The patient's blood pressure is 120/80 and the "
        "heart rate is 72 beats per minute."
    ),
    assessment=(
        "The patient has no structural pathology and "
        "requires further evaluation."
    ),
    plan=(
        "The patient should take antibiotics and undergo "
        "a chest X-ray."
    ),
)


invalid_result = validate_soap_note(
    soap_note=invalid_soap,
    transcript=transcript,
)


print("\n" + "=" * 70)
print("HALLUCINATED SOAP VALIDATION TEST")
print("=" * 70)

print("\nStatus:")
print(invalid_result["status"])

print("\nWarnings:")

if invalid_result["warnings"]:
    for warning in invalid_result["warnings"]:
        print(f"- {warning}")
else:
    print("No warnings.")

print("\nFlagged sentences:")

if invalid_result["flagged_sentences"]:
    for item in invalid_result["flagged_sentences"]:
        if item["reason"] == "high_risk_claim":
            print(
                f"- [{item['section']}] "
                f"{item['sentence']} "
                f"(reason={item['reason']})"
            )
        else:
            print(
                f"- [{item['section']}] "
                f"{item['sentence']} "
                f"(similarity={item['similarity']}, "
                f"reason={item['reason']})"
            )
else:
    print("None.")

print("\nIs valid:")
print(invalid_result["is_valid"])