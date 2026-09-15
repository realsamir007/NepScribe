from app.services.soap.soap_pipeline_service import generate_and_validate_soap


transcript = """
The patient reports a cough that has continued for three weeks.
The patient says the cough is worse at night.

The doctor listens to the patient's chest and documents
no abnormal findings.

The doctor recommends follow-up if symptoms continue.
"""


result = generate_and_validate_soap(
    transcript=transcript,
    top_k=3,
)


soap_note = result["soap_note"]
validation = result["validation"]


print("\n" + "=" * 70)
print("SOAP GENERATION PIPELINE TEST")
print("=" * 70)

print("\nSUBJECTIVE:")
print(soap_note.subjective)

print("\nOBJECTIVE:")
print(soap_note.objective)

print("\nASSESSMENT:")
print(soap_note.assessment)

print("\nPLAN:")
print(soap_note.plan)

print("\n" + "-" * 70)

print("VALIDATION STATUS:")
print(validation["status"])

print("\nVALIDATION WARNINGS:")

if validation["warnings"]:
    for warning in validation["warnings"]:
        print(f"- {warning}")
else:
    print("No warnings.")

print("\nIS VALID:")
print(validation["is_valid"])