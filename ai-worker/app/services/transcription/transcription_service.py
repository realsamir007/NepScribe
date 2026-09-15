from pathlib import Path

import whisper


_model = None


def get_whisper_model():
    global _model

    if _model is None:
        print("Loading Whisper model...")
        _model = whisper.load_model("base")
        print("Whisper model loaded.")

    return _model


def transcribe_audio(audio_path: str):
    file_path = Path(audio_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {file_path}"
        )

    model = get_whisper_model()

    result = model.transcribe(
        str(file_path),
        fp16=False
    )

    return {
        "text": result["text"].strip(),
        "segments": result.get("segments", []),
        "language": result.get("language")
    }