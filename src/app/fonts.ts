import {
  Inter,
  Kaushan_Script,
  Patrick_Hand,
  Permanent_Marker,
  Source_Serif_4,
} from "next/font/google";

/** UI and body text. */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** Serif headings, like "BUILT TO LAST" and the app screen titles in the deck. */
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

/** Brush script for the "Beyond Blue" wordmark. */
export const kaushan = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kaushan",
});

/** Marker caps for big story headlines ("VERONICA STARTS HER PATH."). Not preloaded. */
export const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-permanent-marker",
});

/** Handwritten labels on tape and notes ("Career Readiness"). Not preloaded. */
export const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-patrick-hand",
});

export const fontVariables = [
  inter.variable,
  sourceSerif.variable,
  kaushan.variable,
  permanentMarker.variable,
  patrickHand.variable,
].join(" ");
