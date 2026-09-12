import json

from app.services.diarization_service import diarize_audio
from tests.test_config import AUDIO_DIR, PROCESSED_DIR


consultation_id = "ff6410e2-db48-49d5-a4fe-08437c0a162c"

audio_path = (
    AUDIO_DIR
    / consultation_id
    / "audio-1789215004907_normalized.wav"
)

segments = diarize_audio(str(audio_path))

output_path = PROCESSED_DIR / "diarization_result.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with output_path.open("w", encoding="utf-8") as file:
    json.dump(
        segments,
        file,
        ensure_ascii=False,
        indent=2,
    )

print("\nSpeaker segments:")
print("------------------")

for segment in segments:
    print(
        f"[{segment['start']:.2f}s - "
        f"{segment['end']:.2f}s] "
        f"{segment['speaker']}"
    )

print(f"\nTotal speaker segments: {len(segments)}")
print(f"Saved diarization result to: {output_path}")