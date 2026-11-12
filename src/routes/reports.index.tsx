import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getActiveAccountScope } from "@/lib/account-scope";
import { listReportsForScope } from "@/lib/draft-repository";
import { deriveDeliveryStatus } from "@/lib/sync/delivery-status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports/")({
  component: ReportsIndexPage,
});

function ReportsIndexPage() {
  const scope = getActiveAccountScope();
  const [items, setItems] = useState<Awaited<ReturnType<typeof listReportsForScope>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const subscription = (awaited: Promise<Awaited<ReturnType<typeof listReportsForScope>>>) => {
      void awaited.then((data) => {
        if (active) setItems(data);
      }).catch(() => {
        if (active) setError("Unable to load your reports right now.");
      });
    };
    subscription(listReportsForScope(scope));
    return () => {
      active = false;
    };
  }, [scope]);

  if (scope === "anonymous") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">My Reports</h1>
        <p className="mt-3 text-muted-foreground">Sign in to see your saved reports here.</p>
        <Button asChild className="mt-6">
          <Link to="/report" search={{ segment: undefined }}>Report a hazard</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">My Reports</h1>
        <p className="mt-3 text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Traveller</p>
          <h1 className="font-display text-3xl">My Reports</h1>
        </div>
        <Button asChild variant="outline">
          <Link to="/report" search={{ segment: undefined }}>New report</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
          You have no saved reports in this account yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(({ draft, outbox }) => {
            const status = deriveDeliveryStatus(outbox);
            return (
              <Link
                key={draft.id}
                to="/reports/$id"
                params={{ id: draft.id }}
                className="block rounded-2xl border border-border bg-card p-4 transition hover:border-primary"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{draft.payload.hazardType || "Hazard report"}</span>
                  <span className="rounded-full border border-border px-2 py-1 text-xs capitalize">{status.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {draft.payload.description || "No description provided."}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Observed {draft.observedAtLocal || draft.eventTime || "recently"}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
