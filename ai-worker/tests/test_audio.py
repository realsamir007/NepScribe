from app.services.audio_service import normalize_audio
from tests.test_config import AUDIO_DIR


consultation_id = "ff6410e2-db48-49d5-a4fe-08437c0a162c"

audio_path = (
    AUDIO_DIR
    / consultation_id
    / "audio-1789215004907.mp3"
)

normalized_path = normalize_audio(str(audio_path))

print("\nNormalized audio:")
print(normalized_path)