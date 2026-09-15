import json

from pathlib import Path

from app.services.transcription.transcription_service import transcribe_audio
from tests.test_config import AUDIO_DIR, PROCESSED_DIR


consultation_id = "ff6410e2-db48-49d5-a4fe-08437c0a162c"

audio_path = (
    AUDIO_DIR
    / consultation_id
    / "audio-1789215004907.mp3"
)

result = transcribe_audio(str(audio_path))

output_path = PROCESSED_DIR / "whisper_result.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with output_path.open("w", encoding="utf-8") as file:
    json.dump(result, file, ensure_ascii=False, indent=2)

print("\nDetected language:")
print(result["language"])

print("\nTranscript:")
print(result["text"])

print("\nNumber of segments:")
print(len(result["segments"]))

print(f"\nSaved Whisper result to: {output_path}")