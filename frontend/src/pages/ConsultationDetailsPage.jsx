import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getConsultation,
} from "../features/consultations/consultationService";

import {
  getAudioFiles,
} from "../features/audio/audioService";

import {
  getProcessingJobs,
} from "../features/processing/processingService";

import {
  getTranscript,
} from "../features/transcript/transcriptService";

import {
  getSoapNote,
} from "../features/soap/soapService";

import ProcessingPanel from "../features/processing/ProcessingPanel";
import TranscriptPanel from "../features/transcript/TranscriptPanel";
import SoapNotePanel from "../features/soap/SoapNotePanel";

function ConsultationDetailsPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [processingJob, setProcessingJob] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [soapNote, setSoapNote] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isStartingProcessing, setIsStartingProcessing] =
    useState(false);

  const [error, setError] = useState("");
  const [processingError, setProcessingError] = useState("");

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setIsLoading(true);
        setError("");

        const consultationData =
          await getConsultation(consultationId);

        if (!consultationData) {
          setError("Consultation not found.");
          return;
        }

        setConsultation(consultationData);

        const audioResponse =
          await getAudioFiles(consultationId);

        setAudioFiles(audioResponse?.audioFiles || []);

        const jobsResponse =
          await getProcessingJobs(consultationId);

        const jobs =
          jobsResponse?.processingJobs ||
          jobsResponse?.jobs ||
          [];

        if (jobs.length > 0) {
          const latestJob = jobs[0];

          setProcessingJob(latestJob);

          if (latestJob.status === "completed") {
            try {
              const transcriptData =
                await getTranscript(consultationId);

              setTranscript(transcriptData);
            } catch {
              setTranscript(null);
            }

            try {
              const soapData =
                await getSoapNote(consultationId);

              setSoapNote(soapData);
            } catch {
              setSoapNote(null);
            }
          }
        }
      } catch (requestError) {
        console.error(requestError);
        setError(
          requestError.message ||
            "Failed to load consultation.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId]);

  const handleStartProcessing = async () => {
    try {
      setIsStartingProcessing(true);
      setProcessingError("");

      const { createProcessingJob } =
        await import(
          "../features/processing/processingService"
        );

      const job = await createProcessingJob(
        consultationId,
      );

      setProcessingJob(job);

      setConsultation((current) =>
        current
          ? {
              ...current,
              status: "processing",
            }
          : current,
      );
    } catch (requestError) {
      console.error(requestError);

      setProcessingError(
        requestError.message ||
          "Failed to start AI processing.",
      );
    } finally {
      setIsStartingProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-container py-10">
          <p className="text-sm text-[var(--color-text-muted)]">
            Loading consultation...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !consultation) {
    return (
      <DashboardLayout>
        <div className="page-container py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              {error || "Consultation not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-sm font-medium text-red-700 underline"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-container py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-[var(--color-emerald-ink)]"
        >
          ← Back to Dashboard
        </button>

        <section className="mt-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            Consultation
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
                {consultation.title}
              </h1>

              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {new Date(
                  consultation.created_at,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <span className="w-fit rounded-full bg-stone-100 px-4 py-2 text-sm font-medium capitalize text-stone-700">
              {consultation.status}
            </span>
          </div>
        </section>

        <ProcessingPanel
          audioFiles={audioFiles}
          processingJob={processingJob}
          isStartingProcessing={isStartingProcessing}
          processingError={processingError}
          onStartProcessing={handleStartProcessing}
        />

        <TranscriptPanel
          transcript={transcript}
          isLoading={false}
        />

        {soapNote && (
          <SoapNotePanel
            consultationId={consultationId}
            soapNote={soapNote}
            onSaved={(updatedSoapNote) => {
              setSoapNote(updatedSoapNote);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default ConsultationDetailsPage;