import { useEffect, useState } from "react";

export type OnlineStatus = "unknown" | "online" | "offline";

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      setStatus(
        typeof navigator === "undefined"
          ? "unknown"
          : navigator.onLine
            ? "online"
            : "offline",
      );
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return status;
}
