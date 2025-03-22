import { useEffect, useState } from "react";
import { useUiContext } from "@/src/context/uiContext";
import { Logger } from "tslog";

interface webGLParams {
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  p5: string;
  p6: string;
  p7: string;
  p8: string;
  p9: string;
  p10: string;
  p11: string;
  p12: string;
  p13: string;
  p14: string;
  p15: string;
  p16: string;
  p17: string;
  p18: string;
}

const log = new Logger();

const STORAGE_KEY = "device_fp";

async function generateCanvasFingerprint(): Promise<string | undefined> {
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

async function generateWebglFingerprint(): Promise<webGLParams | string> {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "webgl_not_supported";

    const debugInfo = (gl as WebGLRenderingContext)?.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? (gl as WebGLRenderingContext)?.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "unknown_vendor";
    const renderer = debugInfo ? (gl as WebGLRenderingContext)?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown_renderer";

    async function hash(data: string): Promise<string> {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    }

    const webGLParams = {
      p1: await hash(vendor),
      p2: await hash(renderer),
      p3: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).VERSION))),
      p4: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).SHADING_LANGUAGE_VERSION))),
      p5: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).ALIASED_LINE_WIDTH_RANGE))),
      p6: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).ALIASED_POINT_SIZE_RANGE))),
      p7: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_COMBINED_TEXTURE_IMAGE_UNITS))),
      p8: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_CUBE_MAP_TEXTURE_SIZE))),
      p9: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_FRAGMENT_UNIFORM_VECTORS))),
      p10: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_RENDERBUFFER_SIZE))),
      p11: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_IMAGE_UNITS))),
      p12: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE))),
      p13: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_VARYING_VECTORS))),
      p14: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_VERTEX_ATTRIBS))),
      p15: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_VERTEX_TEXTURE_IMAGE_UNITS))),
      p16: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_VERTEX_UNIFORM_VECTORS))),
      p17: await hash(String((gl as WebGLRenderingContext)?.getParameter((gl as WebGLRenderingContext).MAX_VIEWPORT_DIMS))),
      p18: await hash(String((gl as WebGLRenderingContext)?.getSupportedExtensions()?.sort()?.join(","))),
    };

    return webGLParams;
  } catch (e) {
    console.error("Error getting WebGL info:", e);
    return "webgl_error";
  }
}

async function generateAdditionalFingerprint(): Promise<string> {
  async function hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }
  const h1 = await hash(String(navigator.hardwareConcurrency || "unknown"));
  const h2 = await hash(String(`${screen.width}x${screen.height}`));
  const h3 = await hash(String(screen.colorDepth || "unknown"));
  const h4 = await hash(String(Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"));

  return JSON.stringify({
    h1,
    h2,
    h3,
    h4,
  });
}

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const { showToast } = useUiContext();

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        const persistentId = localStorage.getItem(STORAGE_KEY);
        if (persistentId) {
          setFingerprint(persistentId);
          return;
        }

        const canvasDataURL = await generateCanvasFingerprint();
        const webgl = await generateWebglFingerprint();
        const hardwareInfo = await generateAdditionalFingerprint();

        if (!canvasDataURL) throw new Error("No canvasDaraUrl!");

        async function hash(data: string): Promise<string> {
          const encoder = new TextEncoder();
          const buffer = encoder.encode(data);
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
          return hashHex;
        }

        const canvasHash = await hash(canvasDataURL);

        const combined = {
          c: canvasHash,
          wg: webgl,
          h: hardwareInfo,
        };
        const fingerprintString = JSON.stringify(combined);

        localStorage.setItem(STORAGE_KEY, fingerprintString);
        setFingerprint(fingerprintString);
      } catch (e) {
        log.error(e);
        showToast({
          message: "Error.",
          variant: "error",
          duration: 3000,
        });
      }
    };

    generateFingerprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { fingerprint };
};
