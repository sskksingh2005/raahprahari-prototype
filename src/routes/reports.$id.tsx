import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeliveryStepper } from "@/components/delivery-stepper";
import { NotFoundPage } from "@/components/error-pages";
import { ScreenError, ScreenLoading } from "@/components/screen-states";
import { getActiveAccountScope } from "@/lib/account-scope";
import {
  getReportDetail,
  listReceiptEvents,
  observeReportDetail,
} from "@/lib/draft-repository";

export const Route = createFileRoute("/reports/$id")({
  component: ReportsDetailPage,
});

type Detail = NonNullable<Awaited<ReturnType<typeof getReportDetail>>>;
type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; detail: Detail };

export function ReportsDetailPage() {
  const { id } = Route.useParams();
  return <ReportDetailView id={id} />;
}

/** Local, account-scoped report detail. Exported for tests. */
export function ReportDetailView({ id }: { id: string }) {
  const scope = getActiveAccountScope();
  // Results are tagged with the id/scope they belong to, so a different report
  // shows "loading" until its own data arrives (no stale detail).
  const key = `${scope}|${id}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    state: LoadState;
  } | null>(null);
  const state: LoadState =
    loaded?.key === key ? loaded.state : { status: "loading" };
  const [receiptEvents, setReceiptEvents] = useState<
    Awaited<ReturnType<typeof listReceiptEvents>>
  >([]);

  // Live, so photo upload progress updates without a reload. The local
  // database is read after mount (not during SSR).
  useEffect(() => {
    const subscription = observeReportDetail(
      id,
      scope,
      (detail) =>
        setLoaded({
          key: `${scope}|${id}`,
          state: detail ? { status: "ready", detail } : { status: "missing" },
        }),
      () => setLoaded({ key: `${scope}|${id}`, state: { status: "error" } }),
    );
    return () => subscription.unsubscribe();
  }, [id, scope]);

  useEffect(() => {
    if (!id || scope === "anonymous") return;
    let active = true;
    void listReceiptEvents(id, scope).then((events) => {
      if (active) setReceiptEvents(events);
    });
    return () => {
      active = false;
    };
  }, [id, scope]);

  if (state.status === "loading") return <ScreenLoading />;
  if (state.status === "error")
    return <ScreenError onRetry={() => window.location.reload()} />;
  // Not in this account's local data (or another account's report).
  if (state.status === "missing") return <NotFoundPage />;

  const { draft, outbox, attachments } = state.detail;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Private detail
        </p>
        <h1 className="font-display text-3xl">
          Report #{draft.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold">Observation</h2>
          <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {draft.payload.description}
          </p>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Hazard</dt>
              <dd className="font-medium">
                {draft.payload.hazardType || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Observed</dt>
              <dd>{draft.observedAtLocal || draft.eventTime || "Unknown"}</dd>
            </div>
          </dl>
          {draft.payload.photo ? (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium">Photo evidence</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {draft.payload.photo.name}
              </p>
            </div>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Delivery status</h2>
          <DeliveryStepper
            draft={draft}
            outbox={outbox}
            attachments={attachments}
          />
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Receipt history</h2>
        {receiptEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No receipt history is available for this report.
          </p>
        ) : (
          <ol className="space-y-3">
            {receiptEvents.map((event) => (
              <li
                key={event.id ?? `${event.type}-${event.at}`}
                className="rounded-xl border border-border p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    {event.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.at).toLocaleString()}
                  </span>
                </div>
                {event.detail ? (
                  <p className="mt-1 text-muted-foreground">{event.detail}</p>
                ) : null}
                {event.receiptId ? (
                  <p className="mt-1 font-mono text-xs">{event.receiptId}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
