from app.services.soap.llm_service import generate_response


prompt = """
You are testing the NepScribe local AI worker.

Respond with exactly:

Local LLM integration successful.
"""


response = generate_response(prompt)

print("\n" + "=" * 70)
print("LOCAL LLM TEST")
print("=" * 70)

print("\nResponse:")
print(response)