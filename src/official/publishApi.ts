// src/official/publishApi.ts
import type { OfficialNoticeFormData as NoticeDraft, PublishResult } from "./officialNotice.types";

const ENDPOINT = "/api/official/notices"; // backend ready hone par yahan sahi URL daalna

function mockResult(mode: string): PublishResult {
  switch (mode) {
    case "forbidden":
      return { kind: "forbidden", message: "Server ne bola: is jurisdiction me notice publish karne ki permission nahi hai." };
    case "expired":
      return { kind: "session-expired" };
    case "error":
      return { kind: "error", message: "Server error. Thodi der baad try karo." };
    default:
      return { kind: "success", noticeId: "MOCK-" + Date.now() };
  }
}

export async function publishNotice(draft: NoticeDraft): Promise<PublishResult> {
  // Sirf development me mock chalega. Production build me ye block hat jata hai.
  if (import.meta.env.DEV) {
    const mode = new URLSearchParams(window.location.search).get("mock");
    if (mode !== null) {
      await new Promise((r) => setTimeout(r, 800));
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
      const data = await res.json();
      return { kind: "success", noticeId: String(data.id ?? "") };
    }
    if (res.status === 401) return { kind: "session-expired" };
    if (res.status === 403) {
      return { kind: "forbidden", message: "Server ne is action ki permission nahi di." };
    }
    return { kind: "error", message: `Server error (${res.status}).` };
  } catch {
    return { kind: "error", message: "Network problem. Internet check karke phir try karo." };
  }
}