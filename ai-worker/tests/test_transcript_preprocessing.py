import json

from app.services.transcription.transcript_preprocessing_service import (
    build_clean_transcript,
)
from tests.test_config import PROCESSED_DIR


input_path = (
    PROCESSED_DIR / "speaker_transcript.json"
)

output_path = (
    PROCESSED_DIR / "clean_transcript.json"
)


with input_path.open("r", encoding="utf-8") as file:
    transcript = json.load(file)


clean_segments = build_clean_transcript(
    transcript["segments"]
)


clean_transcript = {
    "language": transcript["language"],
    "segments": clean_segments,
}


output_path.parent.mkdir(
    parents=True,
    exist_ok=True,
)

with output_path.open(
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        clean_transcript,
        file,
        ensure_ascii=False,
        indent=2,
    )


print("\nClean transcript:")
print("----------------")

for segment in clean_segments:

    if segment["type"] == "sound_event":
        print(
            f"[{segment['start']:.2f}s - "
            f"{segment['end']:.2f}s] "
            f"{segment['speaker']} "
            f"[SOUND EVENT]: "
            f"{segment['text']}"
        )

    else:
        print(
            f"[{segment['start']:.2f}s - "
            f"{segment['end']:.2f}s] "
            f"{segment['speaker']}: "
            f"{segment['text']}"
        )


print(
    f"\nOriginal segments: "
    f"{len(transcript['segments'])}"
)

print(
    f"Cleaned segments: "
    f"{len(clean_segments)}"
)

print(
    f"\nSaved clean transcript to: "
    f"{output_path}"
)