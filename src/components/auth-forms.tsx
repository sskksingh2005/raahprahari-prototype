import { useMemo, useState } from "react";
import { useForm, type Control, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import {
  classifyAuthFlowError,
  requestPasswordReset,
  signUpWithEmail,
  updatePassword,
  type AuthFlowErrorKind,
} from "@/lib/auth-flows";

export const MIN_PASSWORD_LENGTH = 8;

export const AUTH_ERROR_KEYS: Record<
  AuthFlowErrorKind | "missing_code",
  TranslationKey
> = {
  network: "login.networkError",
  not_configured: "login.notConfigured",
  user_exists: "authErr.userExists",
  weak_password: "authErr.weakPassword",
  same_password: "authErr.samePassword",
  rate_limited: "authErr.rateLimited",
  session_missing: "authErr.sessionMissing",
  link_invalid: "authErr.linkInvalid",
  missing_code: "authErr.missingCode",
  generic: "login.genericError",
};

function RootError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

type Translate = (key: TranslationKey) => string;

type PasswordPair = { password: string; confirm: string };

const passwordShape = (t: Translate) => ({
  password: z.string().min(MIN_PASSWORD_LENGTH, t("signup.passwordTooShort")),
  confirm: z.string(),
});

const passwordsMatch = (
  t: Translate,
): [(v: PasswordPair) => boolean, { path: string[]; message: string }] => [
  (v) => v.password === v.confirm,
  { path: ["confirm"], message: t("signup.passwordMismatch") },
];

/** Password + confirm fields shared by signup and reset. */
function PasswordPairFields<T extends PasswordPair>({
  control,
  passwordLabel,
}: {
  control: Control<T>;
  passwordLabel: string;
}) {
  const { t } = usePrefs();
  const fields: [keyof PasswordPair, string][] = [
    ["password", passwordLabel],
    ["confirm", t("signup.confirmPassword")],
  ];
  return (
    <>
      {fields.map(([name, label]) => (
        <FormField
          key={name}
          control={control}
          name={name as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={
                    name === "password" ? MIN_PASSWORD_LENGTH : undefined
                  }
                  {...field}
                />
              </FormControl>
              {name === "password" && (
                <FormDescription>{t("signup.passwordHint")}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}

export function SignupForm({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = usePrefs();
  const schema = useMemo(
    () =>
      z
        .object({
          email: z.email(t("login.emailInvalid")),
          ...passwordShape(t),
        })
        .refine(...passwordsMatch(t)),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirm: "" },
  });
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = form.handleSubmit(async ({ email, password }) => {
    form.clearErrors("root");
    try {
      const result = await signUpWithEmail(email.trim(), password);
      form.reset();
      if (result.kind === "signed_in") onSignedIn();
      else setCheckEmail(true);
    } catch (error) {
      form.setValue("password", "");
      form.setValue("confirm", "");
      form.setError("root", {
        message: t(AUTH_ERROR_KEYS[classifyAuthFlowError(error)]),
      });
    }
  });

  if (checkEmail) return <p role="status">{t("signup.checkEmail")}</p>;

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
          <PasswordPairFields
            control={form.control}
            passwordLabel={t("login.password")}
          />
          <RootError message={form.formState.errors.root?.message} />
          <Button type="submit" className="w-full" aria-busy={pending}>
            {pending ? t("signup.submitting") : t("signup.submit")}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}

export function ForgotPasswordForm() {
  const { t } = usePrefs();
  const schema = useMemo(
    () => z.object({ email: z.email(t("login.emailInvalid")) }),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const [sent, setSent] = useState(false);

  const submit = form.handleSubmit(async ({ email }) => {
    form.clearErrors("root");
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error) {
      form.setError("root", {
        message: t(AUTH_ERROR_KEYS[classifyAuthFlowError(error)]),
      });
    }
  });

  if (sent) return <p role="status">{t("forgot.sent")}</p>;

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
          <RootError message={form.formState.errors.root?.message} />
          <Button type="submit" className="w-full" aria-busy={pending}>
            {pending ? t("forgot.submitting") : t("forgot.submit")}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}

export function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const { t } = usePrefs();
  const schema = useMemo(
    () => z.object(passwordShape(t)).refine(...passwordsMatch(t)),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const submit = form.handleSubmit(async ({ password }) => {
    form.clearErrors("root");
    try {
      await updatePassword(password);
      form.reset();
      onDone();
    } catch (error) {
      form.setValue("password", "");
      form.setValue("confirm", "");
      form.setError("root", {
        message: t(AUTH_ERROR_KEYS[classifyAuthFlowError(error)]),
      });
    }
  });

  const pending = form.formState.isSubmitting;
  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <fieldset disabled={pending} className="space-y-4">
          <PasswordPairFields
            control={form.control}
            passwordLabel={t("reset.newPassword")}
          />
          <RootError message={form.formState.errors.root?.message} />
          <Button type="submit" className="w-full" aria-busy={pending}>
            {pending ? t("reset.submitting") : t("reset.submit")}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
