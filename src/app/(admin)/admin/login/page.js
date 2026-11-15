"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, getToken, login } from "@/lib/admin/api";
import { Alert, Button, Field, Input } from "@/components/admin/ui";

const NOTICE = {
  expired: "Your session expired. Please log in again.",
  login: "Please log in to continue.",
};

function LoginForm() {
  const router = useRouter();
  const reason = useSearchParams().get("reason");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(password);
      router.replace("/admin/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.fields.password || err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  // already logged in -> straight to the panel
  useEffect(() => {
    if (getToken()) router.replace("/admin/profile");
  }, [router]);

  return (
    <main className="grid min-h-svh place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <div>
          <h1 className="text-xl font-semibold">Admin login</h1>
          <p className="mt-1 text-sm text-mute">Enter your password to edit the site.</p>
        </div>
        {!error && reason && NOTICE[reason] && <Alert kind="info">{NOTICE[reason]}</Alert>}
        <Alert>{error}</Alert>
        <Field label="Password">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>
        <Button type="submit" loading={busy} className="w-full">
          Log in
        </Button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
