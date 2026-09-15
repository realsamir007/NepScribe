import { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getConsultations,
} from "../features/consultations/consultationService";

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setError("");

        const data = await getConsultations();

        setConsultations(data?.consultations || []);
      } catch (requestError) {
        console.error("Failed to load consultations:", requestError);

        setError(
          requestError?.message ||
          "Failed to load consultations.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultations();
  }, []);

  const totalConsultations = consultations.length;

  const processingConsultations = consultations.filter(
    (consultation) => consultation.status === "processing",
  ).length;

  const completedConsultations = consultations.filter(
    (consultation) =>
      consultation.status === "completed" ||
      consultation.status === "reviewed",
  ).length;

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

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="page-container py-10">
        {/* Welcome */}
        <section>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Welcome back
          </p>

          <h2 className="mt-1 text-3xl font-semibold text-[var(--color-emerald-ink)]">
            {user?.name ? `Dr. ${user.name}` : "Doctor"}
          </h2>

          <p className="mt-2 text-[var(--color-text-secondary)]">
            Manage your clinical consultations and documentation.
          </p>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <Card>
            <Card.Header>
              <Card.Description>
                Total Consultations
              </Card.Description>

              <Card.Title className="text-3xl text-[var(--color-emerald-ink)]">
                {isLoading ? "—" : totalConsultations}
              </Card.Title>
            </Card.Header>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>
                Processing
              </Card.Description>

              <Card.Title className="text-3xl text-[var(--color-emerald-ink)]">
                {isLoading ? "—" : processingConsultations}
              </Card.Title>
            </Card.Header>
          </Card>

          <Card>
            <Card.Header>
              <Card.Description>
                Completed
              </Card.Description>

              <Card.Title className="text-3xl text-[var(--color-emerald-ink)]">
                {isLoading ? "—" : completedConsultations}
              </Card.Title>
            </Card.Header>
          </Card>
        </section>

        {/* Consultations */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Recent Consultations
              </h3>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Your latest clinical documentation sessions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/consultations/new")}
              className="rounded-lg bg-[var(--color-emerald-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              + New Consultation
            </button>
          </div>

          {error && (
            <Card className="mt-5">
              <Card.Content className="py-6">
                <p className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              </Card.Content>
            </Card>
          )}

          {!error && isLoading && (
            <Card className="mt-5">
              <Card.Content className="py-10 text-center">
                <p className="text-[var(--color-text-secondary)]">
                  Loading consultations...
                </p>
              </Card.Content>
            </Card>
          )}

          {!error && !isLoading && consultations.length === 0 && (
            <Card className="mt-5">
              <Card.Content className="py-12 text-center">
                <p className="text-[var(--color-text-secondary)]">
                  No consultations yet.
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Create a new consultation to begin.
                </p>
              </Card.Content>
            </Card>
          )}

          {!error && !isLoading && consultations.length > 0 && (
            <div className="mt-5 flex flex-col gap-3">
              {consultations.map((consultation) => (
                <button
                  key={consultation.id}
                  type="button"
                  onClick={() =>
                    navigate(`/consultations/${consultation.id}`)
                  }
                  className="w-full text-left"
                >
                  <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
                    <Card.Content className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate font-medium text-[var(--color-text-primary)]">
                          {consultation.title}
                        </h4>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {formatDate(consultation.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            consultation.status,
                          )}`}
                        >
                          {formatStatus(consultation.status)}
                        </span>

                        <span className="text-sm text-[var(--color-text-muted)]">
                          →
                        </span>
                      </div>
                    </Card.Content>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;