import { useAuth } from "../context/AuthContext";

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="page-container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-emerald-ink)]">
              NepScribe
            </h1>

            <p className="text-xs text-[var(--color-text-muted)]">
              Clinical Documentation Assistant
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                Dr. {user.name}
              </span>
            )}

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-stone-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default DashboardLayout;