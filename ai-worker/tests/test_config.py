from pathlib import Path


# NepScribe/
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# NepScribe/storage/
STORAGE_DIR = PROJECT_ROOT / "storage"

# NepScribe/storage/audio/
AUDIO_DIR = STORAGE_DIR / "audio"

# NepScribe/storage/processed/
PROCESSED_DIR = STORAGE_DIR / "processed"