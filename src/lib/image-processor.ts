// Utility functions for HSL conversion, needed for histogram equalization
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Enhancement Functions
function applyGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  return imageData;
}

function applyLowPass(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const new_data = new Uint8ClampedArray(data.length);
  const kernel_size = 3;
  const half_kernel = Math.floor(kernel_size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r_sum = 0,
        g_sum = 0,
        b_sum = 0,
        count = 0;
      for (let ky = -half_kernel; ky <= half_kernel; ky++) {
        for (let kx = -half_kernel; kx <= half_kernel; kx++) {
          const px = x + kx;
          const py = y + ky;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const index = (py * width + px) * 4;
            r_sum += data[index];
            g_sum += data[index + 1];
            b_sum += data[index + 2];
            count++;
          }
        }
      }
      const index = (y * width + x) * 4;
      new_data[index] = r_sum / count;
      new_data[index + 1] = g_sum / count;
      new_data[index + 2] = b_sum / count;
      new_data[index + 3] = data[index + 3];
    }
  }
  return new ImageData(new_data, width, height);
}

function applySharpen(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const new_data = new Uint8ClampedArray(data.length);
  // Sharpening kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ];
  const kernel_size = 3;
  const half_kernel = Math.floor(kernel_size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r_sum = 0,
        g_sum = 0,
        b_sum = 0;

      for (let ky = -half_kernel; ky <= half_kernel; ky++) {
        for (let kx = -half_kernel; kx <= half_kernel; kx++) {
          const px = x + kx;
          const py = y + ky;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const index = (py * width + px) * 4;
            const weight = kernel[ky + half_kernel][kx + half_kernel];
            r_sum += data[index] * weight;
            g_sum += data[index + 1] * weight;
            b_sum += data[index + 2] * weight;
          }
        }
      }

      const index = (y * width + x) * 4;
      new_data[index] = Math.max(0, Math.min(255, r_sum));
      new_data[index + 1] = Math.max(0, Math.min(255, g_sum));
      new_data[index + 2] = Math.max(0, Math.min(255, b_sum));
      new_data[index + 3] = data[index + 3];
    }
  }
  return new ImageData(new_data, width, height);
}

function applyGammaCorrection(imageData: ImageData, gamma = 2.2): ImageData {
  const data = imageData.data;
  const gamma_inv = 1 / gamma;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 * (data[i] / 255) ** gamma_inv;
    data[i + 1] = 255 * (data[i + 1] / 255) ** gamma_inv;
    data[i + 2] = 255 * (data[i + 2] / 255) ** gamma_inv;
  }
  return imageData;
}

function applyHistogramEqualization(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const LUMINANCE_LEVELS = 256;
  const histogram = new Array(LUMINANCE_LEVELS).fill(0);
  const cdf = new Array(LUMINANCE_LEVELS).fill(0);
  const totalPixels = width * height;

  const hslData = [];

  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    hslData.push({ h, s, l });
    const l_quantized = Math.round(l * (LUMINANCE_LEVELS - 1));
    histogram[l_quantized]++;
  }

  let cdf_min = totalPixels;
  let cumulative = 0;
  for (let i = 0; i < LUMINANCE_LEVELS; i++) {
    cumulative += histogram[i];
    cdf[i] = cumulative;
    if (cumulative > 0 && cumulative < cdf_min) {
      cdf_min = cumulative;
    }
  }

  const new_data = new Uint8ClampedArray(data.length);
  for (let i = 0; i < hslData.length; i++) {
    const { h, s, l } = hslData[i];
    const l_quantized = Math.round(l * (LUMINANCE_LEVELS - 1));

    const new_l =
      (cdf[l_quantized] - cdf_min) / (totalPixels - cdf_min);

    const [r, g, b] = hslToRgb(h, s, new_l);
    new_data[i * 4] = r;
    new_data[i * 4 + 1] = g;
    new_data[i * 4 + 2] = b;
    new_data[i * 4 + 3] = data[i * 4 + 3];
  }

  return new ImageData(new_data, width, height);
}


type EnhancementResult = {
  id: "grayscale" | "low-pass" | "gamma" | "histogram" | "sharpen";
  dataUrl: string;
};

export async function processImage(src: string): Promise<EnhancementResult[]> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(image, 0, 0);

  const enhancementsToApply = ["grayscale", "low-pass", "gamma", "histogram", "sharpen"] as const;

  const results: EnhancementResult[] = [];

  for (const id of enhancementsToApply) {
    let originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let enhancedImageData: ImageData;

    switch (id) {
      case "grayscale":
        enhancedImageData = applyGrayscale(originalImageData);
        break;
      case "low-pass":
        enhancedImageData = applyLowPass(originalImageData);
        break;
      case "gamma":
        enhancedImageData = applyGammaCorrection(originalImageData);
        break;
      case "histogram":
        enhancedImageData = applyHistogramEqualization(originalImageData);
        break;
      case "sharpen":
        enhancedImageData = applySharpen(originalImageData);
        break;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) throw new Error("Could not create temp canvas context");
    tempCtx.putImageData(enhancedImageData, 0, 0);
    results.push({ id, dataUrl: tempCanvas.toDataURL("image/png") });
  }

  return results;
}
