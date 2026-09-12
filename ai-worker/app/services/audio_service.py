from pathlib import Path
import subprocess


def normalize_audio(input_path: str) -> str:
    input_file = Path(input_path)

    if not input_file.exists():
        raise FileNotFoundError(
            f"Audio file not found: {input_file}"
        )

    output_file = (
        input_file.parent
        / f"{input_file.stem}_normalized.wav"
    )

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_file),
        "-ac",
        "1",
        "-ar",
        "16000",
        "-sample_fmt",
        "s16",
        str(output_file),
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    return str(output_file)