import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { fetchPublic } from "@/api/fetch";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export default function useVisitorHeartbeat() {
  const { pathname } = useLocation();
  const latestPathRef = useRef(pathname);

  useEffect(() => {
    latestPathRef.current = pathname;
  }, [pathname]);

  const sendHeartbeat = useCallback(async ({ path, isPageView = false }) => {
    try {
      await fetchPublic("/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, isPageView }),
      });
    } catch {
      // Analytics should never block UX.
    }
  }, []);

  useEffect(() => {
    if (!pathname) return;
    sendHeartbeat({ path: pathname, isPageView: true });
  }, [pathname, sendHeartbeat]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        sendHeartbeat({ path: latestPathRef.current || "/", isPageView: false });
      }
    }, HEARTBEAT_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) {
        sendHeartbeat({ path: latestPathRef.current || "/", isPageView: false });
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sendHeartbeat]);
}
