/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/register.tsx
import { useState, useEffect, FormEvent } from "react";
import sha256 from "crypto-js/sha256";

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
  } catch (e: any) {
    return "webgl error" + e;
  }
}

export default function RegisterForm({}: any) {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    const canvas = generateCanvasFingerprint();
    const webgl = generateWebglFingerprint();
    const combined = `${canvas}-${webgl}`;
    const hash = sha256(combined).toString();
    setFingerprint(hash);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      username: { value: string };
      password: { value: string };
    };
    const username = target.username.value;
    const password = target.password.value;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, fingerprint }),
      });

      if (response.ok) {
        // Registro exitoso
        console.log("Registered");
      } else {
        // Manejar errores
        console.log("Error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="Username" />
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Register</button>
      <input type="hidden" name="fingerprint" value={fingerprint || ""} />
    </form>
  );
}
