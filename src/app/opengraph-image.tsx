import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette } from "@/lib/design/tokens";

export const alt = "Beyond Blue: What happens after graduation? From Countdown to Launchpad.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Kaushan Script (SIL Open Font License, see ./_og/OFL.txt), read once at build time.
const kaushan = await readFile(join(process.cwd(), "src/app/_og/KaushanScript-Regular.ttf"));

/** Social share card: the deck's title slide in miniature. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Satori has no conic gradients, so the sunburst becomes a radial glow.
        background: `radial-gradient(circle at 50% 45%, ${palette["royal-500"]}, ${palette["royal-700"]} 70%)`,
      }}
    >
      <div
        style={{
          width: 1000,
          height: 470,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: palette["cream-50"],
          boxShadow: `10px 14px 0 rgba(10,45,115,0.35)`,
        }}
      >
        <div
          style={{
            display: "flex",
            background: palette["navy-800"],
            padding: "10px 48px 22px",
            transform: "rotate(-1.5deg)",
            fontFamily: "Kaushan",
            fontSize: 150,
            color: palette["cream-100"],
          }}
        >
          Beyond<span style={{ color: palette["blue-300"], marginLeft: 36 }}>Blue</span>
        </div>
        <div
          style={{ marginTop: 34, fontSize: 52, color: palette["navy-900"], fontFamily: "Kaushan" }}
        >
          What happens after graduation?
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: palette["ink-600"] }}>
          From Countdown to Launchpad · Bluefield State University
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Kaushan", data: kaushan, style: "normal", weight: 400 }] },
  );
}
