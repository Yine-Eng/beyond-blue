"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { recordLaunchFileExport } from "@/lib/actions/launch-file";
import type { LaunchFileData } from "@/lib/data/launch-file";

const fileName = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-launch-file.pdf`.replace(/^-/, "");

/** Builds the PDF in the browser, then shares it (phones) or downloads it. */
export function DownloadPdfButton({ data, disabled }: { data: LaunchFileData; disabled: boolean }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  const download = async () => {
    setState("working");
    try {
      const { renderLaunchFilePdf } = await import("./launch-file-pdf");
      const blob = await renderLaunchFilePdf(data, window.location.origin);
      const file = new File([blob], fileName(data.student.name), { type: "application/pdf" });

      // Phones get the share sheet (Save to Files, Drive, email); everything else downloads.
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      if (coarse && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My Beyond Blue Launch File" });
        } catch (error) {
          if ((error as Error).name !== "AbortError") throw error;
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
      setState("done");
      void recordLaunchFileExport();
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={download} disabled={disabled || state === "working"}>
        {state === "working" ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <Download aria-hidden="true" />
        )}
        {state === "working" ? "Building your PDF…" : "Download PDF"}
      </Button>
      <p role="status" className="text-body-sm text-ink-600 min-h-5">
        {disabled && "Finish your first step to unlock the PDF."}
        {state === "done" && "Your Launch File PDF is ready."}
        {state === "error" && (
          <span className="text-danger font-semibold">
            We couldn&apos;t build the PDF. Please try again.
          </span>
        )}
      </p>
    </div>
  );
}
