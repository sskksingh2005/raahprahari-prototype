import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/features/auth/auth-pages";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password | RaahPrahari" }] }),
  component: ResetPasswordPage,
});
