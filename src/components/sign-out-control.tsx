import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrefs } from "@/i18n/preferences";
import { getActiveAccountScope } from "@/lib/account-scope";
import { signOutAccount } from "@/lib/account-session";
import { countUnsyncedDrafts } from "@/lib/draft-repository";

/** null = the check itself failed, so the count is unknown. */
type Pending = { count: number | null } | null;

/**
 * Sign-out that first checks this account's unsynced reports. Drafts are
 * never deleted; they stay in this account's local scope and resume syncing
 * after the same account signs in again.
 */
export function SignOutButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "default";
}) {
  const { t } = usePrefs();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);

  const signOut = async () => {
    setBusy(true);
    try {
      await signOutAccount();
    } catch {
      // The local session is cleared either way; keep the provider failure visible.
      toast.error(t("login.signOutError"));
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const start = async () => {
    setBusy(true);
    let count: number | null;
    try {
      count = await countUnsyncedDrafts(getActiveAccountScope());
    } catch {
      count = null;
    }
    setBusy(false);
    if (count === 0) await signOut();
    else setPending({ count });
  };

  const count = pending?.count ?? null;
  const warning =
    count === null
      ? t("signout.unknown")
      : t(count === 1 ? "signout.unsyncedOne" : "signout.unsyncedMany").replace(
          "{count}",
          String(count),
        );

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={busy}
        aria-busy={busy}
        onClick={() => void start()}
      >
        {busy ? t("login.signingOut") : t("login.signOut")}
      </Button>
      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("signout.title")}
            </DialogTitle>
            <DialogDescription>{warning}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("signout.kept")}</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              {t("signout.cancel")}
            </Button>
            <Button
              type="button"
              disabled={busy}
              aria-busy={busy}
              onClick={() => void signOut()}
            >
              {busy ? t("login.signingOut") : t("signout.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
