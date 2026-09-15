import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  getConsultation,
} from "../features/consultations/consultationService";

import {
  getAudioFiles,
  uploadAudio,
} from "../features/audio/audioService";

import {
  createProcessingJob,
  getProcessingJobs,
  getProcessingJob,
} from "../features/processing/processingService";

import {
  isActiveProcessingStatus,
} from "../features/processing/processingUtils";

import ProcessingPanel from "../components/processing/ProcessingPanel";

import AudioUploadCard from "../components/audio/AudioUploadCard";

import AudioFilesList from "../components/audio/AudioFilesList";

import { getTranscript } from "../features/transcript/transcriptService";

import { getSoapNote } from "../features/soap/soapService";

import TranscriptPanel from "../components/transcript/TranscriptPanel";

import SoapNotePanel from "../components/soap/SoapNotePanel";


function ConsultationPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const pollingRef = useRef(null);

  const [consultation, setConsultation] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [audioFiles, setAudioFiles] = useState([]);

  const [processingJob, setProcessingJob] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);

  const [isStartingProcessing, setIsStartingProcessing] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [processingError, setProcessingError] = useState("");

  const [transcript, setTranscript] = useState(null);

  const [soapNote, setSoapNote] = useState(null);

  const [isLoadingTranscript, setIsLoadingTranscript] =
    useState(false);

  const [isLoadingSoapNote, setIsLoadingSoapNote] =
    useState(false);


  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };


  const loadConsultation = async () => {
    try {
      setError("");

      const data = await getConsultation(consultationId);

      if (!data) {
        throw new Error("Consultation not found.");
      }

      setConsultation(data);
    } catch (requestError) {
      console.error(
        "Failed to load consultation:",
        requestError,
      );

      setError(
        requestError?.message ||
          "Failed to load consultation.",
      );
    }
  };


  const loadAudioFiles = async () => {
    try {
      setError("");

      const data = await getAudioFiles(consultationId);

      setAudioFiles(data?.audioFiles || []);
    } catch (requestError) {
      console.error(
        "Failed to load audio files:",
        requestError,
      );

      setError(
        requestError?.message ||
          "Failed to load audio files.",
      );
    } finally {
      setIsLoading(false);
    }
  };


  const loadProcessingJob = async () => {
    try {
      setProcessingError("");

      const response =
        await getProcessingJobs(consultationId);

      const jobs = Array.isArray(response)
        ? response
        : response?.jobs ||
          response?.processingJobs ||
          [];

      const latestJob = jobs[0] || null;

      setProcessingJob(latestJob);
    } catch (requestError) {
      console.error(
        "Failed to load processing jobs:",
        requestError,
      );

      setProcessingError(
        requestError?.message ||
          "Failed to load processing status.",
      );
    }
  };


  useEffect(() => {
    loadConsultation();
    loadAudioFiles();
    loadProcessingJob();

    return () => {
      stopPolling();
    };
  }, [consultationId]);


  const startPolling = (jobId) => {
    stopPolling();

    pollingRef.current = setInterval(async () => {
      try {
        const updatedJob = await getProcessingJob(
          consultationId,
          jobId,
        );

        if (!updatedJob || !updatedJob.id) {
          console.warn(
            "Processing endpoint returned an invalid job:",
            updatedJob,
          );

          return;
        }

        setProcessingJob(updatedJob);

        if (!isActiveProcessingStatus(updatedJob.status)) {
          stopPolling();

          if (updatedJob.status === "completed") {
            setConsultation((current) =>
              current
                ? {
                    ...current,
                    status: "completed",
                  }
                : current,
            );
          }

          if (updatedJob.status === "failed") {
            setConsultation((current) =>
              current
                ? {
                    ...current,
                    status: "failed",
                  }
                : current,
            );
          }
        }
      } catch (requestError) {
        console.error(
          "Processing polling error:",
          requestError,
        );

        setProcessingError(
          requestError?.message ||
            "Failed to retrieve processing status.",
        );

        stopPolling();
      }
    }, 3000);
  };


  useEffect(() => {
    if (!processingJob?.id) {
      return;
    }

    if (isActiveProcessingStatus(processingJob.status)) {
      startPolling(processingJob.id);
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [
    processingJob?.id,
    processingJob?.status,
    consultationId,
  ]);


  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setSelectedFile(file || null);

    setError("");

    setSuccess("");
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an audio file first.");

      return;
    }

    try {
      setError("");

      setSuccess("");

      setIsUploading(true);

      const data = await uploadAudio(
        consultationId,
        selectedFile,
      );

      const uploadedAudio = data?.audioFile;

      if (uploadedAudio) {
        setAudioFiles((currentFiles) => [
          uploadedAudio,
          ...currentFiles,
        ]);
      } else {
        await loadAudioFiles();
      }

      setSelectedFile(null);

      const fileInput =
        document.getElementById("audio-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setConsultation((current) =>
        current
          ? {
              ...current,
              status: "uploaded",
            }
          : current,
      );

      setSuccess("Audio uploaded successfully.");
    } catch (requestError) {
      console.error(
        "Audio upload error:",
        requestError,
      );

      setError(
        requestError?.message ||
          "Failed to upload audio.",
      );
    } finally {
      setIsUploading(false);
    }
  };


  const handleStartProcessing = async () => {
    if (audioFiles.length === 0) {
      setProcessingError(
        "Please upload an audio file before starting processing.",
      );

      return;
    }

    try {
      setProcessingError("");

      setSuccess("");

      setIsStartingProcessing(true);

      const job = await createProcessingJob(
        consultationId,
      );

      if (!job || !job.id) {
        console.error(
          "Invalid create-job response:",
          job,
        );

        throw new Error(
          "The backend did not return a valid processing job.",
        );
      }

      setProcessingJob(job);

      setConsultation((current) =>
        current
          ? {
              ...current,
              status: "processing",
            }
          : current,
      );

      if (isActiveProcessingStatus(job.status)) {
        startPolling(job.id);
      }
    } catch (requestError) {
      console.error(
        "Start processing error:",
        requestError,
      );

      setProcessingError(
        requestError?.message ||
          "Failed to start AI processing.",
      );
    } finally {
      setIsStartingProcessing(false);
    }
  };


  const loadTranscript = async () => {
    try {
      setIsLoadingTranscript(true);

      const data = await getTranscript(
        consultationId,
      );

      setTranscript(data);
    } catch (requestError) {
      console.error(
        "Failed to load transcript:",
        requestError,
      );

      setTranscript(null);
    } finally {
      setIsLoadingTranscript(false);
    }
  };


  const loadSoapNote = async () => {
    try {
      setIsLoadingSoapNote(true);

      const data = await getSoapNote(
        consultationId,
      );

      setSoapNote(data);
    } catch (requestError) {
      console.error(
        "Failed to load SOAP note:",
        requestError,
      );

      setSoapNote(null);
    } finally {
      setIsLoadingSoapNote(false);
    }
  };


  useEffect(() => {
    if (processingJob?.status !== "completed") {
      return;
    }

    loadTranscript();

    loadSoapNote();
  }, [
    processingJob?.status,
    consultationId,
  ]);


  const getStatusClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";

      case "reviewed":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "uploaded":
        return "bg-amber-100 text-amber-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "created":
        return "bg-stone-100 text-stone-700";

      default:
        return "bg-stone-100 text-stone-700";
    }
  };


  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };


  return (
    <DashboardLayout>
      <div className="page-container py-10">

        {/* Header */}

        <section>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 text-sm font-medium text-[var(--color-emerald-ink)] hover:underline"
          >
            ← Back to Dashboard
          </button>

          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Consultation
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <h1 className="text-3xl font-semibold text-[var(--color-emerald-ink)]">
              {consultation?.title ||
                "Consultation"}
            </h1>

            {consultation?.status && (
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                  consultation.status,
                )}`}
              >
                {formatStatus(
                  consultation.status,
                )}
              </span>
            )}

          </div>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Upload the consented doctor-patient
            recording for transcription and SOAP
            note generation.
          </p>

          <p className="mt-2 break-all text-xs text-[var(--color-text-muted)]">
            Consultation ID: {consultationId}
          </p>
        </section>


        {/* Audio Upload */}

        <AudioUploadCard
          selectedFile={selectedFile}
          isUploading={isUploading}
          error={error}
          success={success}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />


        {/* Audio Files */}

        <AudioFilesList
          audioFiles={audioFiles}
          isLoading={isLoading}
        />


        {/* Processing */}

        <ProcessingPanel
          audioFiles={audioFiles}
          processingJob={processingJob}
          isStartingProcessing={isStartingProcessing}
          processingError={processingError}
          onStartProcessing={
            handleStartProcessing
          }
        />


        {/* Transcript */}

        <TranscriptPanel
          transcript={transcript}
          isLoading={isLoadingTranscript}
        />


        {/* SOAP Note */}

        <SoapNotePanel
          soapNote={soapNote}
          isLoading={isLoadingSoapNote}
          consultationId={consultationId}
          onSaved={setSoapNote}
        />

      </div>
    </DashboardLayout>
  );
}

export default ConsultationPage;