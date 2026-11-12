import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { NewPasswordForm, AUTH_ERROR_KEYS } from "@/components/auth-forms";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import { useAccountSession } from "@/lib/account-session";
import {
  completeAuthCallback,
  type CallbackResult,
  type SafeNext,
} from "@/lib/auth-flows";

function AuthPageShell({
  title,
  children,
}: {
  title: TranslationKey;
  children: React.ReactNode;
}) {
  const { t } = usePrefs();
  return (
    <div className="rp-container py-12">
      <section
        aria-labelledby="auth-page-title"
        className="mx-auto max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h1
          id="auth-page-title"
          className="font-display text-2xl font-semibold"
        >
          {t(title)}
        </h1>
        {children}
      </section>
    </div>
  );
}

function HomeLink() {
  const { t } = usePrefs();
  return (
    <Link
      to="/"
      className="inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline"
    >
      {t("callback.home")}
    </Link>
  );
}

/**
 * /auth/callback: exchanges the one-time code from a confirmation or
 * recovery email for a session, then continues to an allow-listed page.
 */
export function AuthCallbackPage({
  onContinue,
  run = completeAuthCallback,
}: {
  onContinue: (next: SafeNext) => void;
  run?: (href: string) => Promise<CallbackResult>;
}) {
  const { t } = usePrefs();
  const [result, setResult] = useState<CallbackResult | null>(null);
  // Codes are single-use; StrictMode must not exchange the same code twice.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run(window.location.href).then((r) => {
      setResult(r);
      if (r.ok) onContinue(r.next);
    });
  }, [run, onContinue]);

  if (!result || result.ok) {
    return (
      <AuthPageShell title="callback.title">
        <p role="status">{t("callback.checking")}</p>
      </AuthPageShell>
    );
  }
  return (
    <AuthPageShell title="callback.failedTitle">
      <p role="alert" className="text-sm text-destructive">
        {t(AUTH_ERROR_KEYS[result.kind])}
      </p>
      <HomeLink />
    </AuthPageShell>
  );
}

/** /auth/reset-password: needs the recovery session created by the callback. */
export function ResetPasswordPage() {
  const { t } = usePrefs();
  const session = useAccountSession();
  const [done, setDone] = useState(false);

  return (
    <AuthPageShell title="reset.title">
      {done ? (
        <>
          <p role="status">{t("reset.done")}</p>
          <HomeLink />
        </>
      ) : session.status === "loading" ? (
        <p role="status">{t("login.checking")}</p>
      ) : session.status === "authenticated" ? (
        <>
          <p className="text-sm text-muted-foreground">{t("reset.body")}</p>
          <NewPasswordForm onDone={() => setDone(true)} />
        </>
      ) : (
        <>
          <p role="alert">{t("reset.noSession")}</p>
          <HomeLink />
        </>
      )}
    </AuthPageShell>
  );
}
