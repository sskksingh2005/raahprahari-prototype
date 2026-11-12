import type {
  OfficialNoticeFormData as NoticeDraft,
  PublishResult,
} from "./officialNotice.types";

// No backend serves this yet (see /status). Update it when one exists.
const ENDPOINT = "/api/official/notices";

function mockResult(mode: string): PublishResult {
  switch (mode) {
    case "forbidden":
      return { kind: "forbidden" };
    case "expired":
      return { kind: "session-expired" };
    case "error":
      return { kind: "error", reason: "server", status: 500 };
    default:
      return { kind: "success", noticeId: "MOCK-" + Date.now() };
  }
}

export async function publishNotice(
  draft: NoticeDraft,
): Promise<PublishResult> {
  // Development-only mock: ?mock=, ?mock=forbidden, ?mock=expired, ?mock=error.
  // The whole block is removed from production builds.
  if (import.meta.env.DEV) {
    const mode = new URLSearchParams(window.location.search).get("mock");
    if (mode !== null) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockResult(mode);
    }
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const data: unknown = await res.json().catch(() => ({}));
      const id =
        data && typeof data === "object" && "id" in data ? String(data.id) : "";
      return { kind: "success", noticeId: id };
    }
    if (res.status === 401) return { kind: "session-expired" };
    if (res.status === 403) return { kind: "forbidden" };
    return { kind: "error", reason: "server", status: res.status };
  } catch {
    return { kind: "error", reason: "network" };
  }
}
