from pathlib import Path

from dotenv import load_dotenv
import os

from pyannote.audio import Pipeline

load_dotenv()

_pipeline = None


def get_diarization_pipeline():
    global _pipeline

    if _pipeline is None:
        token = os.getenv("HUGGINGFACE_TOKEN")

        if not token:
            raise ValueError(
                "HUGGINGFACE_TOKEN is not configured."
            )

        print("Loading diarization pipeline...")

        _pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            token=token,
        )

        print("Diarization pipeline loaded.")

    return _pipeline


def diarize_audio(audio_path: str):
    file_path = Path(audio_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {file_path}"
        )

    pipeline = get_diarization_pipeline()

    output = pipeline(str(file_path))

    if hasattr(output, "speaker_diarization"):
        diarization = output.speaker_diarization
    else:
        diarization = output

    segments = []

    for turn, _, speaker in diarization.itertracks(
        yield_label=True
    ):
        segments.append(
            {
                "speaker": speaker,
                "start": round(turn.start, 2),
                "end": round(turn.end, 2),
            }
        )

    return segments