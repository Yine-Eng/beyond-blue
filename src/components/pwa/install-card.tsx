"use client";

import { Share, SquarePlus, Smartphone, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { installStore } from "./install-store";

const DISMISS_KEY = "bb:install-dismissed";

type Platform = "prompt" | "ios" | null;

function detectIos() {
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || iPadOs;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * "Add Beyond Blue to your home screen": the native prompt on Android/Chrome, step-by-step
 * instructions on iOS (Safari has no prompt). Hidden once installed or dismissed.
 */
export function InstallCard() {
  const deferred = useSyncExternalStore(
    installStore.subscribe,
    installStore.get,
    installStore.getServer,
  );
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Storage can be blocked; just show the card.
    }
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only checks after hydration */
    setIos(detectIos());
    setHidden(dismissed || isStandalone());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const platform: Platform = deferred ? "prompt" : ios ? "ios" : null;
  if (hidden || !platform) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to remember it in; it stays hidden for this visit.
    }
  };

  return (
    <aside
      aria-labelledby="install-title"
      className="rounded-card relative border-2 border-dashed border-blue-300 bg-white p-4"
    >
      <button
        type="button"
        onClick={dismiss}
        className="text-ink-600 hover:text-navy-900 absolute top-1 right-1 grid size-11 place-items-center rounded-full"
      >
        <X aria-hidden="true" className="size-4" />
        <span className="sr-only">Hide this tip</span>
      </button>
      <h2 id="install-title" className="text-navy-900 flex items-center gap-2 pr-10 font-semibold">
        <Smartphone aria-hidden="true" className="size-5" /> Keep Beyond Blue on your home screen
      </h2>
      <p className="text-body-sm text-ink-600 mt-1">
        Open your plan in one tap, full-screen, like any other app.
      </p>
      {platform === "prompt" ? (
        <Button className="mt-3" onClick={() => void installStore.prompt()}>
          <SquarePlus aria-hidden="true" /> Install the app
        </Button>
      ) : showSteps ? (
        <ol className="text-body-sm text-ink-900 mt-3 flex list-decimal flex-col gap-1 pl-5">
          <li>
            Tap <Share aria-hidden="true" className="inline size-4 align-text-bottom" /> Share in
            Safari&apos;s toolbar.
          </li>
          <li>
            Scroll down and tap <strong>Add to Home Screen</strong>.
          </li>
          <li>
            Tap <strong>Add</strong>.
          </li>
        </ol>
      ) : (
        <Button variant="outline" className="mt-3 bg-white" onClick={() => setShowSteps(true)}>
          <SquarePlus aria-hidden="true" /> Show me how
        </Button>
      )}
    </aside>
  );
}
