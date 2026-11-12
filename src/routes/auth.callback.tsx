import { useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthCallbackPage } from "@/features/auth/auth-pages";
import type { SafeNext } from "@/lib/auth-flows";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Confirming your link | RaahPrahari" }] }),
  component: AuthCallbackRoute,
});

function AuthCallbackRoute() {
  const navigate = useNavigate();
  const onContinue = useCallback(
    (next: SafeNext) => void navigate({ to: next, replace: true }),
    [navigate],
  );
  return <AuthCallbackPage onContinue={onContinue} />;
}
