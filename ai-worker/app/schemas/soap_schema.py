from pydantic import BaseModel, Field


class SOAPNote(BaseModel):
    subjective: str = Field(
        default="",
        description="Information reported by the patient or caregiver.",
    )

    objective: str = Field(
        default="",
        description="Observable or measurable findings documented during the consultation.",
    )

    assessment: str = Field(
        default="",
        description="The clinician's documented assessment or clinical impression.",
    )

    plan: str = Field(
        default="",
        description="The clinician's documented management plan.",
    )