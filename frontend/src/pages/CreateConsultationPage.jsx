import { useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { useNavigate } from "react-router-dom";

import { createConsultation } from "../features/consultations/consultationService";

function CreateConsultationPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const data = await createConsultation(title);

      const consultation = data?.consultation;

      if (!consultation?.id) {
        throw new Error("Consultation was created but no ID was returned.");
      }

      navigate(`/consultations/${consultation.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--color-emerald-ink)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <Card className="border border-[var(--color-border)] bg-white shadow-sm">
          <Card.Header className="border-b border-[var(--color-border)] px-6 py-5">
            <Card.Title className="text-2xl font-semibold text-[var(--color-emerald-ink)]">
              New Consultation
            </Card.Title>

            <Card.Description>
              Create a consultation before uploading the doctor-patient
              recording.
            </Card.Description>
          </Card.Header>

          <Card.Content className="px-6 py-6">
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
            >
              <Input
                label="Consultation title"
                placeholder="e.g. Back Pain Consultation"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onPress={() => navigate("/dashboard")}
                  className="border border-[var(--color-border)] bg-white text-[var(--color-text-primary)]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="bg-[var(--color-emerald-ink)] text-white"
                >
                  {isSubmitting
                    ? "Creating..."
                    : "Create Consultation"}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}

export default CreateConsultationPage;