/// <reference lib="dom" />

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const widthInput = document.getElementById(
  "width-input",
) as HTMLInputElement;
const resizeBtn = document.getElementById(
  "resize-btn",
) as HTMLButtonElement;
const downloadBtn = document.getElementById(
  "download-btn",
) as HTMLButtonElement;
const infoSource = document.getElementById("info-source") as HTMLDivElement;
const infoOutput = document.getElementById("info-output") as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let sourceImage: HTMLImageElement | null = null;
let sourceMimeType: string | null = null;
let sourceName: string | null = null;

function loadFile(file: File | null): void {
  if (!file || !file.type.startsWith("image/")) return;
  sourceMimeType = file.type;
  sourceName = file.name || null;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      resizeBtn.disabled = false;
      infoSource.textContent =
        `入力: ${img.naturalWidth} × ${img.naturalHeight} px` +
        (sourceName ? ` — ${sourceName}` : "");
      doResize();
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function doResize(): void {
  if (!sourceImage || !sourceMimeType) return;
  const targetW = parseInt(widthInput.value, 10);
  if (!targetW || targetW <= 0) return;

  const targetH = Math.round(
    sourceImage.naturalHeight * targetW / sourceImage.naturalWidth,
  );

  canvas.width = targetW;
  canvas.height = targetH;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(sourceImage, 0, 0, targetW, targetH);

  canvas.style.display = "block";
  downloadBtn.disabled = false;

  infoOutput.textContent = `出力: ${targetW} × ${targetH} px`;
}

fileInput.addEventListener("change", () => {
  loadFile(fileInput.files?.[0] ?? null);
});

resizeBtn.addEventListener("click", doResize);

downloadBtn.addEventListener("click", () => {
  if (!sourceMimeType) return;
  const base = sourceName?.replace(/\.[^.]+$/, "") ?? "resized";
  const ext = sourceName?.match(/\.([^.]+)$/)?.[1] ??
    sourceMimeType.split("/")[1];
  const a = document.createElement("a");
  a.href = canvas.toDataURL(sourceMimeType, 0.92);
  a.download = `${base}.${ext}`;
  a.click();
});

document.addEventListener("paste", (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      loadFile(item.getAsFile());
      break;
    }
  }
});
