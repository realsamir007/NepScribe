from pathlib import Path

import pytest

from app.pipelines.audio_to_transcript_pipeline import (
    run_audio_to_transcript_pipeline,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]

AUDIO_STORAGE_PATH = (
    PROJECT_ROOT
    / "storage"
    / "audio"
)


SUPPORTED_AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".flac",
    ".ogg",
    ".webm",
}


def find_test_audio_file() -> Path | None:
    """
    Find the first supported audio file inside backend/storage/audio.

    The test is skipped when no audio file is available.
    """

    if not AUDIO_STORAGE_PATH.exists():
        return None

    for file_path in AUDIO_STORAGE_PATH.rglob("*"):
        if (
            file_path.is_file()
            and file_path.suffix.lower()
            in SUPPORTED_AUDIO_EXTENSIONS
        ):
            return file_path

    return None


def test_audio_to_transcript_pipeline():
    """
    Verify the complete audio-to-transcript pipeline.

    The pipeline should:
    1. Transcribe the audio using Whisper.
    2. Detect speakers using pyannote.
    3. Align transcript segments with speakers.
    4. Clean and merge the transcript.
    """

    audio_path = find_test_audio_file()

    if audio_path is None:
        pytest.skip(
            "No supported audio file found in "
            "backend/storage/audio."
        )

    result = run_audio_to_transcript_pipeline(
        str(audio_path)
    )

    assert result["audio_path"] == str(audio_path)
    assert result["language"] is not None

    assert isinstance(result["raw_text"], str)
    assert isinstance(result["text"], str)

    assert isinstance(
        result["whisper_segments"],
        list,
    )

    assert isinstance(
        result["diarization_segments"],
        list,
    )

    assert isinstance(
        result["aligned_segments"],
        list,
    )

    assert isinstance(
        result["segments"],
        list,
    )

    assert len(result["whisper_segments"]) > 0
    assert len(result["diarization_segments"]) > 0
    assert len(result["aligned_segments"]) > 0
    assert len(result["segments"]) > 0

    for segment in result["segments"]:
        assert "id" in segment
        assert "start" in segment
        assert "end" in segment
        assert "speaker" in segment
        assert "text" in segment
        assert "type" in segment

        assert isinstance(segment["start"], float)
        assert isinstance(segment["end"], float)
        assert isinstance(segment["speaker"], str)
        assert isinstance(segment["text"], str)

        assert segment["end"] >= segment["start"]
        assert segment["text"].strip() != ""