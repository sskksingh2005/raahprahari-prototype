import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePrefs } from "@/i18n/preferences";
import type { TranslationKey } from "@/i18n/dictionary";
import {
  applyAuthSession,
  signOutAccount,
  useAccountSession,
} from "@/lib/account-session";
import { SupabaseConfigError, getSupabaseClient } from "@/lib/supabase";

export type LoginErrorKind =
  | "invalid_credentials"
  | "network"
  | "not_configured"
  | "no_session"
  | "generic";

const ERROR_KEYS: Record<LoginErrorKind, TranslationKey> = {
  invalid_credentials: "login.invalidCredentials",
  network: "login.networkError",
  not_configured: "login.notConfigured",
  no_session: "login.noSession",
  generic: "login.genericError",
};

/** Maps Supabase/auth errors to a user-facing category without exposing details. */
export function classifyLoginError(error: unknown): LoginErrorKind {
  if (error instanceof SupabaseConfigError) return "not_configured";
  if (typeof navigator !== "undefined" && navigator.onLine === false)
    return "network";
  const e = (error ?? {}) as { name?: string; code?: string; status?: number };
  if (e.code === "invalid_credentials") return "invalid_credentials";
  if (e.name === "AuthApiError" && e.status === 400)
    return "invalid_credentials";
  if (
    e.name === "AuthRetryableFetchError" ||
    e.name === "TypeError" ||
    e.status === 0
  )
    return "network";
  return "generic";
}

/** Signs in with Supabase. Resolves only when Supabase returns a session. */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.session) {
    throw Object.assign(new Error("No session returned"), {
      code: "no_session",
    });
  }
  applyAuthSession(data.session);
  return data.session;
}

function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = usePrefs();
  const schema = useMemo(
    () =>
      z.object({
        email: z.email(t("login.emailInvalid")),
        password: z.string().min(1, t("login.passwordRequired")),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit(async ({ email, password }) => {
    form.clearErrors("root");
    try {
      await signInWithEmail(email.trim(), password);
      form.reset();
      onSignedIn();
    } catch (error) {
      const kind =
        (error as { code?: string })?.code === "no_session"
          ? "no_session"
          : classifyLoginError(error);
      form.setValue("password", "");
      form.setError("root", { message: t(ERROR_KEYS[kind]) });
    }
  });

  const pending = form.formState.isSubmitting;
  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <fieldset disabled={pending} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("login.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("login.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <Button type="submit" className="w-full" aria-busy={pending}>
            {pending ? t("login.submitting") : t("login.submit")}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}

function SignedInPanel() {
  const { t } = usePrefs();
  const [pending, setPending] = useState(false);
  const signOut = async () => {
    setPending(true);
    try {
      await signOutAccount();
    } catch {
      // The local session is already cleared, so this panel unmounts; a toast
      // keeps the provider failure visible.
      toast.error(t("login.signOutError"));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="space-y-4">
      <p role="status">{t("login.signedIn")}</p>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => void signOut()}
      >
        {pending ? t("login.signingOut") : t("login.signOut")}
      </Button>
    </div>
  );
}

export function LoginDialog({
  open,
  onOpenChange,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { t } = usePrefs();
  const session = useAccountSession();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current?.isConnected) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display">{t("login.title")}</DialogTitle>
          <DialogDescription>{t("login.body")}</DialogDescription>
        </DialogHeader>
        {session.status === "loading" ? (
          <p role="status">{t("login.checking")}</p>
        ) : session.status === "authenticated" ? (
          <SignedInPanel />
        ) : (
          <LoginForm onSignedIn={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
