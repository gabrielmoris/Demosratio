import { useEffect, useState } from "react";
import sha256 from "crypto-js/sha256";
import { useUiContext } from "@/src/context/uiContext";
import { Logger } from "tslog";

const log = new Logger();

const STORAGE_KEY = "device_fp";

function generateCanvasFingerprint(): string | undefined {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas CTX");

  // Account for device pixel ratio
  const dpr = window.devicePixelRatio || 1;
  const originalWidth = 300;
  const originalHeight = 150;
  canvas.width = originalWidth * dpr;
  canvas.height = originalHeight * dpr;
  ctx.scale(dpr, dpr);

  // Drawing Canvas
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("canvas fingerprinting", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("canvas fingerprinting", 4, 17);

  return canvas.toDataURL();
}

function generateWebglFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "webgl_not_supported";

    const debugInfo = (gl as WebGLRenderingContext)?.getExtension(
      "WEBGL_debug_renderer_info"
    );
    const vendor = debugInfo
      ? (gl as WebGLRenderingContext)?.getParameter(
          debugInfo.UNMASKED_VENDOR_WEBGL
        )
      : "unknown_vendor";
    const renderer = debugInfo
      ? (gl as WebGLRenderingContext)?.getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL
        )
      : "unknown_renderer";

    const parameters = {
      VENDOR: (gl as WebGLRenderingContext)?.getParameter(
        (gl as WebGLRenderingContext).VENDOR
      ),
      VERSION: (gl as WebGLRenderingContext)?.getParameter(
        (gl as WebGLRenderingContext).VERSION
      ),
      MAX_TEXTURE_SIZE: (gl as WebGLRenderingContext)?.getParameter(
        (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
      ),
      UNMASKED_VENDOR: vendor,
      UNMASKED_RENDERER: renderer,
    };

    return JSON.stringify(parameters);
  } catch {
    throw new Error("Webgl error");
  }
}

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const { showToast } = useUiContext();

  useEffect(() => {
    try {
      const persistentId = localStorage.getItem(STORAGE_KEY);
      if (persistentId) {
        setFingerprint(persistentId);
        return;
      }

      const canvas = generateCanvasFingerprint();
      const webgl = generateWebglFingerprint();
      const combined = `${canvas}-${webgl}`;
      const hash = sha256(combined).toString();

      localStorage.setItem(STORAGE_KEY, hash);
      setFingerprint(hash);
    } catch (e) {
      log.error(e);
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
