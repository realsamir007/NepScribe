from pathlib import Path

from app.services.audio.audio_service import normalize_audio
from app.services.transcription.transcription_service import transcribe_audio
from app.services.transcription.transcript_service import (
    merge_transcript_with_speakers,
)
from app.services.transcription.diarization_service import diarize_audio
from app.services.transcription.transcript_preprocessing_service import (
    build_clean_transcript,
)


def run_audio_to_transcript_pipeline(audio_path: str) -> dict:
    """
    Run the complete audio-to-transcript pipeline.

    Steps:
    1. Validate the audio file.
    2. Normalize audio to 16 kHz mono WAV.
    3. Transcribe audio using Whisper.
    4. Detect speakers using pyannote.
    5. Align Whisper segments with speaker segments.
    6. Clean and merge the speaker-attributed transcript.
    """

    file_path = Path(audio_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {file_path}"
        )

    if not file_path.is_file():
        raise ValueError(
            f"Audio path is not a file: {file_path}"
        )

    print(
        f"Starting audio-to-transcript pipeline: {file_path}"
    )

    # ---------------------------------------------------------
    # Step 0: Normalize audio
    # ---------------------------------------------------------
    print("Step 0/5: Normalizing audio to WAV...")

    normalized_audio_path = normalize_audio(
        str(file_path)
    )

    print(
        f"Audio normalized: {normalized_audio_path}"
    )

    # ---------------------------------------------------------
    # Step 1: Whisper transcription
    # ---------------------------------------------------------
    print("Step 1/5: Running Whisper transcription...")

    transcription_result = transcribe_audio(
        normalized_audio_path
    )

    whisper_segments = transcription_result.get(
        "segments",
        []
    )

    print(
        f"Whisper completed with "
        f"{len(whisper_segments)} segments."
    )

    # ---------------------------------------------------------
    # Step 2: Speaker diarization
    # ---------------------------------------------------------
    print("Step 2/5: Running speaker diarization...")

    diarization_segments = diarize_audio(
        normalized_audio_path
    )

    print(
        f"Diarization completed with "
        f"{len(diarization_segments)} speaker segments."
    )

    # ---------------------------------------------------------
    # Step 3: Speaker alignment
    # ---------------------------------------------------------
    print("Step 3/5: Aligning transcript with speakers...")

    aligned_segments = merge_transcript_with_speakers(
        whisper_segments=whisper_segments,
        diarization_segments=diarization_segments,
    )

    print(
        f"Speaker alignment completed with "
        f"{len(aligned_segments)} segments."
    )

    # ---------------------------------------------------------
    # Step 4: Transcript cleaning
    # ---------------------------------------------------------
    print("Step 4/5: Cleaning transcript...")

    clean_segments = build_clean_transcript(
        aligned_segments
    )

    print(
        f"Transcript preprocessing completed with "
        f"{len(clean_segments)} segments."
    )

    # ---------------------------------------------------------
    # Build final speaker-attributed transcript
    # ---------------------------------------------------------
    clean_text = "\n".join(
        (
            f"[{segment['start']:.2f} - "
            f"{segment['end']:.2f}] "
            f"{segment['speaker']}: "
            f"{segment['text']}"
        )
        for segment in clean_segments
    )

    return {
        "audio_path": str(file_path),
        "normalized_audio_path": normalized_audio_path,
        "language": transcription_result.get("language"),
        "raw_text": transcription_result.get("text", ""),
        "whisper_segments": whisper_segments,
        "diarization_segments": diarization_segments,
        "aligned_segments": aligned_segments,
        "segments": clean_segments,
        "text": clean_text,
    }