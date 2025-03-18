import { useEffect, useState } from "react";
import sha256 from "crypto-js/sha256";
import { useUiContext } from "@/src/context/uiContext";
import { Logger } from "tslog";

const log = new Logger();

function generateCanvasFingerprint(): string | undefined {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const txt = "canvas fingerprinting";
  if (!ctx) return undefined;
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 17);
  return canvas.toDataURL();
}

function generateWebglFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "webgl not supported";
    const extension = (gl as WebGLRenderingContext)?.getExtension("WEBGL_debug_renderer_info");
    if (!extension) return "webgl extension not supported";
    const renderer = (gl as WebGLRenderingContext)?.getParameter(extension.UNMASKED_RENDERER_WEBGL);
    if (!renderer) return "webgl renderer not found";
    return renderer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    log.error(e);
    return "Error";
  }
}

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const { showToast } = useUiContext();

  useEffect(() => {
    try {
      const canvas = generateCanvasFingerprint();
      const webgl = generateWebglFingerprint();
      const combined = `${canvas}-${webgl}`;
      const hash = sha256(combined).toString();
      setFingerprint(hash);
    } catch {
      showToast({
        message: "Error.",
        variant: "error",
        duration: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { fingerprint };
};
