"use client";

import { useEffect } from "react";
import { captureInstallPrompt } from "./install-store";

/** Registers the service worker in production builds and starts listening for install prompts. */
export function ServiceWorker() {
  useEffect(() => {
    captureInstallPrompt();
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installability is a progressive enhancement; the app works without it.
    });
  }, []);
  return null;
}
