import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

import { updateSoapNote } from "../../features/soap/soapService";

function SoapNotePanel({
  soapNote,
  isLoading,
  consultationId,
  onSaved,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  useEffect(() => {
    if (!soapNote) {
      return;
    }

    setFormData({
      subjective: soapNote.subjective || "",
      objective: soapNote.objective || "",
      assessment: soapNote.assessment || "",
      plan: soapNote.plan || "",
    });
  }, [soapNote]);

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setSaveError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (soapNote) {
      setFormData({
        subjective: soapNote.subjective || "",
        objective: soapNote.objective || "",
        assessment: soapNote.assessment || "",
        plan: soapNote.plan || "",
      });
    }

    setSaveError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      const updatedSoapNote = await updateSoapNote(
        consultationId,
        formData,
      );

      onSaved(updatedSoapNote);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update SOAP note:", error);

      setSaveError(
        error?.message || "Failed to save reviewed SOAP note.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mt-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            SOAP Note
          </h2>

          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Loading SOAP note...
          </p>
        </div>
      </section>
    );
  }

  if (!soapNote) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                SOAP Note
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {isEditing
                  ? "Review and edit the AI-generated clinical documentation."
                  : "AI-generated clinical documentation"}
              </p>
            </div>

            {!isEditing && (
              <Button
                type="button"
                onPress={handleEdit}
                className="bg-[var(--color-emerald-ink)] text-white"
              >
                Edit SOAP Note
              </Button>
            )}
          </div>
        </div>

        {/* SOAP Fields */}
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <SoapField
            label="Subjective"
            value={formData.subjective}
            isEditing={isEditing}
            onChange={(value) =>
              handleChange("subjective", value)
            }
          />

          <SoapField
            label="Objective"
            value={formData.objective}
            isEditing={isEditing}
            onChange={(value) =>
              handleChange("objective", value)
            }
          />

          <SoapField
            label="Assessment"
            value={formData.assessment}
            isEditing={isEditing}
            onChange={(value) =>
              handleChange("assessment", value)
            }
          />

          <SoapField
            label="Plan"
            value={formData.plan}
            isEditing={isEditing}
            onChange={(value) =>
              handleChange("plan", value)
            }
          />
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mx-6 mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Editing Actions */}
        {isEditing && (
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onPress={handleCancel}
              isDisabled={isSaving}
              className="border border-[var(--color-border)]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onPress={handleSave}
              isDisabled={isSaving}
              className="bg-[var(--color-emerald-ink)] text-white"
            >
              {isSaving
                ? "Saving..."
                : "Save Reviewed SOAP Note"}
            </Button>
          </div>
        )}

        {/* Status */}
        {!isEditing && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-6 py-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                soapNote.status === "reviewed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {soapNote.status || "draft"}
            </span>

            <span className="text-xs text-[var(--color-text-muted)]">
              Version {soapNote.version || 1}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function SoapField({
  label,
  value,
  onChange,
  isEditing,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </label>

      {isEditing ? (
        <textarea
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          rows={7}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-emerald-ink)] focus:ring-2 focus:ring-[var(--color-emerald-ink)]/10"
        />
      ) : (
        <div className="min-h-[180px] whitespace-pre-wrap rounded-lg bg-stone-50 px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {value || "No information available."}
        </div>
      )}
    </div>
  );
}

export default SoapNotePanel;