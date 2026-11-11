import { EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { usePrefs } from "@/i18n/preferences";

/** Loading skeleton: role="status", same card shapes as the lists it replaces. */
export function ScreenLoading() {
  const { t } = usePrefs();
  return <LoadingState variant="cards" label={t("state.loading")} />;
}

/** Error with a retry action: role="alert". */
export function ScreenError({ onRetry }: { onRetry: () => void }) {
  const { t } = usePrefs();
  return (
    <ErrorState
      title={t("state.errorTitle")}
      message={t("state.errorBody")}
      retryLabel={t("state.retry")}
      onRetry={onRetry}
    />
  );
}

/** Empty state: role="status". Empty never implies the road is clear. */
export function ScreenEmpty({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div role="status">
      <EmptyState title={title} message={message} />
    </div>
  );
}
