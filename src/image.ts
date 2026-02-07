import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROBOTO_FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf";

let _fontCache: ArrayBuffer | null = null;

async function loadDefaultFont(): Promise<ArrayBuffer> {
  if (_fontCache) return _fontCache;
  const res = await fetch(ROBOTO_FONT_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Roboto font: ${res.status} ${res.statusText}`);
  }
  _fontCache = await res.arrayBuffer();
  return _fontCache;
}

export interface RenderImageOptions {
  width?: number;
  height?: number;
  satoriOptions?: Partial<SatoriOptions>;
}

export async function renderImage(
  element: React.ReactNode,
  options: RenderImageOptions = {},
): Promise<Buffer> {
  const { width = 1200, height = 630, satoriOptions } = options;

  const fontData = await loadDefaultFont();

  const opts: SatoriOptions = {
    width,
    height,
    fonts: [
      {
        name: "Roboto",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
    ...satoriOptions,
  };

  const svg = await satori(element as React.ReactNode, opts);

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

export async function generateBlinkImage(
  html: string,
  options: RenderImageOptions = {},
): Promise<Buffer> {
  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a2e",
        color: "#e0e0e0",
        fontSize: 48,
        fontFamily: "Roboto",
        padding: 40,
        textAlign: "center" as const,
      },
      children: html,
    },
  };

  return renderImage(element, options);
}
