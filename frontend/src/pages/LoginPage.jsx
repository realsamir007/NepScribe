import { useState } from "react";
import { Button, Card, Input } from "@heroui/react";

import { login as loginUser } from "../features/auth/authService";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginUser(email, password);

      login(data.token, data.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <Card className="w-full max-w-md border border-[var(--color-border)] bg-white shadow-lg">
        <Card.Header className="border-b border-[var(--color-border)] px-6 py-5">
          <Card.Title className="text-2xl font-semibold text-[var(--color-emerald-ink)]">
            Welcome to NepScribe
          </Card.Title>

          <Card.Description className="mt-1 text-[var(--color-text-secondary)]">
            Sign in to your clinical documentation workspace.
          </Card.Description>
        </Card.Header>

        <Card.Content className="px-6 py-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full"
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="w-full rounded-lg bg-[var(--color-emerald-ink)] px-4 py-3 font-medium text-white"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </main>
  );
}

export default LoginPage;
