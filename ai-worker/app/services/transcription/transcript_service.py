def calculate_overlap(
    start_a: float,
    end_a: float,
    start_b: float,
    end_b: float,
) -> float:
    """
    Calculate the amount of time two segments overlap.
    """

    overlap_start = max(start_a, start_b)
    overlap_end = min(end_a, end_b)

    return max(0.0, overlap_end - overlap_start)


def distance_to_segment(
    point: float,
    start: float,
    end: float,
) -> float:
    """
    Calculate the distance from a point to a time segment.

    Returns 0 if the point is inside the segment.
    """

    if start <= point <= end:
        return 0.0

    if point < start:
        return start - point

    return point - end


def assign_speaker(
    whisper_segment: dict,
    diarization_segments: list[dict],
    max_gap: float = 1.0,
) -> str:
    """
    Assign the most likely speaker to a Whisper segment.

    The speaker with the greatest timestamp overlap is selected.

    If there is no overlap, the nearest speaker segment is used
    if it is within max_gap seconds.
    """

    whisper_start = whisper_segment["start"]
    whisper_end = whisper_segment["end"]

    best_speaker = None
    best_overlap = 0.0

    for diarization_segment in diarization_segments:
        overlap = calculate_overlap(
            whisper_start,
            whisper_end,
            diarization_segment["start"],
            diarization_segment["end"],
        )

        if overlap > best_overlap:
            best_overlap = overlap
            best_speaker = diarization_segment["speaker"]

    if best_speaker is not None:
        return best_speaker

    # No direct overlap.
    # Use the midpoint of the Whisper segment to find
    # the nearest diarization segment.
    midpoint = (whisper_start + whisper_end) / 2

    nearest_speaker = None
    nearest_distance = float("inf")

    for diarization_segment in diarization_segments:
        distance = distance_to_segment(
            midpoint,
            diarization_segment["start"],
            diarization_segment["end"],
        )

        if distance < nearest_distance:
            nearest_distance = distance
            nearest_speaker = diarization_segment["speaker"]

    if nearest_distance <= max_gap:
        return nearest_speaker

    return "UNKNOWN"


def merge_transcript_with_speakers(
    whisper_segments: list[dict],
    diarization_segments: list[dict],
) -> list[dict]:
    """
    Combine Whisper transcription segments with speaker labels.
    """

    aligned_segments = []

    for index, whisper_segment in enumerate(whisper_segments):

        speaker = assign_speaker(
            whisper_segment,
            diarization_segments,
        )

        aligned_segments.append(
            {
                "id": index,
                "start": whisper_segment["start"],
                "end": whisper_segment["end"],
                "speaker": speaker,
                "text": whisper_segment["text"].strip(),
            }
        )

    return aligned_segments