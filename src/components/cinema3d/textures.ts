import * as THREE from "three";

/**
 * Creates a seamless procedural canvas texture of the luxury geometric carpet
 * seen in the reference cinema photograph (interwoven beige, tan, dark brown, and black geometric motifs).
 */
export function createLuxuryCarpetTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new ImageData(1, 1) as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Base beige/tan carpet tone
    ctx.fillStyle = "#E0CCA8";
    ctx.fillRect(0, 0, 512, 512);

    const cellW = 32;
    const cellH = 32;
    const palette = ["#1A1008", "#C4924A", "#3D2B1B", "#F5EAD4", "#825C30", "#5C4028"];

    for (let y = 0; y < 512; y += cellH) {
      for (let x = 0; x < 512; x += cellW) {
        const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
        const colorIdx = Math.floor(hash * palette.length) % palette.length;

        // Geometric woven rectangle pattern
        ctx.fillStyle = palette[colorIdx];
        ctx.fillRect(x + 2, y + 3, cellW - 4, cellH / 2 - 2);

        // Secondary cross-stitch accent
        const altColor = palette[(colorIdx + 2) % palette.length];
        ctx.fillStyle = altColor;
        ctx.fillRect(x + cellW / 2, y + cellH / 2 + 1, cellW / 2 - 2, cellH / 2 - 3);

        // Subtle dark weave pinstripes
        ctx.fillStyle = "rgba(20, 12, 6, 0.25)";
        ctx.fillRect(x, y + cellH - 1, cellW, 1);
        ctx.fillRect(x + cellW - 1, y, 1, cellH);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates a subtle acoustic fabric wall texture with warm amber tones and vertical ribbing.
 */
export function createAcousticWallTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new ImageData(1, 1) as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Rich warm amber base (#A86518)
    ctx.fillStyle = "#A86518";
    ctx.fillRect(0, 0, 256, 256);

    // Subtle vertical acoustic ribbing
    for (let x = 0; x < 256; x += 8) {
      ctx.fillStyle = "rgba(120, 68, 12, 0.4)";
      ctx.fillRect(x, 0, 2, 256);
      ctx.fillStyle = "rgba(235, 175, 75, 0.25)";
      ctx.fillRect(x + 2, 0, 2, 256);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates an elegant curved silver cinema screen texture with glowing golden branding.
 */
export function createCinemaScreenTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(new ImageData(1, 1) as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Deep cinema backdrop
    ctx.fillStyle = "#0a0806";
    ctx.fillRect(0, 0, 1024, 512);

    // Warm radial projector screen glow
    const grad = ctx.createRadialGradient(512, 256, 40, 512, 256, 460);
    grad.addColorStop(0, "rgba(255, 248, 225, 0.98)");
    grad.addColorStop(0.35, "rgba(212, 175, 55, 0.45)");
    grad.addColorStop(0.75, "rgba(168, 101, 24, 0.2)");
    grad.addColorStop(1, "rgba(10, 8, 6, 0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(14, 14, 996, 484);

    // Metallic champagne gold border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 12;
    ctx.strokeRect(14, 14, 996, 484);

    // Typography
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 66px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.fillText("LUMIÈRE", 512, 215);

    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 24px 'Manrope', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("THE SOVEREIGN AUDITORIUM • IMAX 70mm", 512, 275);

    ctx.fillStyle = "#E8C9A0";
    ctx.font = "18px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("EXPERIENCE CINEMA BEYOND THE SCREEN", 512, 325);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
