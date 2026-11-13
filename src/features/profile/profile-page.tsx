import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoginDialog } from "@/components/login-dialog";
import { SignOutButton } from "@/components/sign-out-control";
import type { TranslationKey } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import { useAccountSession } from "@/lib/account-session";
import type { Lang, Theme } from "@/lib/app-store";

function ChoiceGroup<T extends string>({
  id,
  legend,
  value,
  options,
  onChange,
}: {
  id: string;
  legend: string;
  value: T;
  options: { value: T; label: string; lang?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">{legend}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className="flex flex-wrap gap-4"
      >
        {options.map((option) => (
          <div key={option.value} className="flex min-h-11 items-center gap-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label htmlFor={`${id}-${option.value}`} lang={option.lang}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function AccountSection() {
  const { t } = usePrefs();
  const session = useAccountSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const signInRef = useRef<HTMLButtonElement>(null);

  if (session.status === "loading") {
    return <p role="status">{t("login.checking")}</p>;
  }
  if (session.status !== "authenticated") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("profile.signedOut")}
        </p>
        <Button
          ref={signInRef}
          type="button"
          onClick={() => setLoginOpen(true)}
        >
          {t("login.submit")}
        </Button>
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          returnFocusRef={signInRef}
        />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">{t("profile.email")}</dt>
        <dd className="break-all">
          {session.email ?? t("profile.emailUnknown")}
        </dd>
        <dt className="text-muted-foreground">{t("profile.role")}</dt>
        <dd>{session.role ?? t("profile.roleNone")}</dd>
      </dl>
      {/* Roles come from the server and cannot be changed here. */}
      <p className="text-xs text-muted-foreground">{t("profile.roleNote")}</p>
      <SignOutButton />
    </div>
  );
}

export function ProfilePage() {
  const { t, lang, setLang, theme, setTheme } = usePrefs();
  const themeOptions: { value: Theme; label: TranslationKey }[] = [
    { value: "light", label: "profile.themeLight" },
    { value: "dark", label: "profile.themeDark" },
    { value: "system", label: "profile.themeSystem" },
  ];
  return (
    <div className="rp-container py-12">
      <div className="mx-auto max-w-reading space-y-6">
        <h1 className="font-display text-3xl font-semibold">
          {t("profile.title")}
        </h1>
        <section
          aria-labelledby="profile-account"
          className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground"
        >
          <h2
            id="profile-account"
            className="font-display text-xl font-semibold"
          >
            {t("profile.account")}
          </h2>
          <AccountSection />
        </section>
        <section
          aria-labelledby="profile-prefs"
          className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground"
        >
          <div>
            <h2
              id="profile-prefs"
              className="font-display text-xl font-semibold"
            >
              {t("profile.preferences")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("profile.prefsNote")}
            </p>
          </div>
          <ChoiceGroup<Lang>
            id="profile-lang"
            legend={t("profile.language")}
            value={lang}
            onChange={setLang}
            options={[
              { value: "en", label: "English", lang: "en" },
              { value: "hi", label: "हिन्दी", lang: "hi" },
            ]}
          />
          <ChoiceGroup<Theme>
            id="profile-theme"
            legend={t("profile.theme")}
            value={theme}
            onChange={setTheme}
            options={themeOptions.map((o) => ({
              value: o.value,
              label: t(o.label),
            }))}
          />
        </section>
      </div>
    </div>
  );
}
