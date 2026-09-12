import json

from app.services.transcript_service import (
    merge_transcript_with_speakers,
)
from tests.test_config import PROCESSED_DIR


whisper_path = PROCESSED_DIR / "whisper_result.json"

diarization_path = (
    PROCESSED_DIR / "diarization_result.json"
)

output_path = (
    PROCESSED_DIR / "speaker_transcript.json"
)


with whisper_path.open("r", encoding="utf-8") as file:
    whisper_result = json.load(file)


with diarization_path.open("r", encoding="utf-8") as file:
    diarization_segments = json.load(file)


aligned_segments = merge_transcript_with_speakers(
    whisper_result["segments"],
    diarization_segments,
)


result = {
    "language": whisper_result["language"],
    "segments": aligned_segments,
}


output_path.parent.mkdir(parents=True, exist_ok=True)

with output_path.open("w", encoding="utf-8") as file:
    json.dump(
        result,
        file,
        ensure_ascii=False,
        indent=2,
    )


print("\nSpeaker-attributed transcript:")
print("--------------------------------")

for segment in aligned_segments:
    print(
        f"[{segment['start']:.2f}s - "
        f"{segment['end']:.2f}s] "
        f"{segment['speaker']}: "
        f"{segment['text']}"
    )

print(
    f"\nTotal transcript segments: "
    f"{len(aligned_segments)}"
)

print(
    f"Saved aligned transcript to: "
    f"{output_path}"
)