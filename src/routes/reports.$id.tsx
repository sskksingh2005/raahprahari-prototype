import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeliveryStepper } from "@/components/delivery-stepper";
import { getActiveAccountScope } from "@/lib/account-scope";
import { listReceiptEvents, listReportsForScope } from "@/lib/draft-repository";

export const Route = createFileRoute("/reports/$id")({
  component: ReportsDetailPage,
});

function ReportsDetailPage() {
  const { id } = Route.useParams();
  const scope = getActiveAccountScope();
  const [report, setReport] = useState<
    Awaited<ReturnType<typeof listReportsForScope>>[number] | null
  >(null);
  const [receiptEvents, setReceiptEvents] = useState<
    Awaited<ReturnType<typeof listReceiptEvents>>
  >([]);

  useEffect(() => {
    let active = true;
    void listReportsForScope(scope).then((entries) => {
      if (!active) return;
      const match = entries.find((entry) => entry.draft.id === id) ?? null;
      setReport(match);
    });
    return () => {
      active = false;
    };
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

  if (!report) {
    throw notFound();
  }

  const { draft, outbox } = report;

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
          <DeliveryStepper draft={draft} outbox={outbox} attachments={[]} />
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
