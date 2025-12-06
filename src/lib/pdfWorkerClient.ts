/* PDF Worker Client - quản lý singleton Worker, warmup và request/response */
type Question = {
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
};

export interface GeneratePayload {
  filename: string;
  title: string;
  description?: string;
  questions: Question[];
  showResults: boolean;
  userAnswers?: number[];
  locale?: string; // 'vi' or 'en'
}

interface GenerateMessage {
  type: "generate";
  requestId: string;
  payload: GeneratePayload;
}

interface WarmupMessage {
  type: "warmup";
  requestId: string;
}

type IncomingMessage = GenerateMessage | WarmupMessage;

interface ReadyResponse {
  type: "ready";
  requestId: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
}

interface WarmupOkResponse {
  type: "warmup-ok";
  requestId: string;
}

interface ErrorResponse {
  type: "error";
  requestId: string;
  message: string;
}

type OutgoingMessage = ReadyResponse | WarmupOkResponse | ErrorResponse;

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<
  string,
  { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
>();

function getWorker(): Worker {
  if (worker) return worker;

  // Vite style import cho Web Worker ESM
  worker = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url), {
    type: "module",
  });

  worker.addEventListener("message", (e: MessageEvent<OutgoingMessage>) => {
    const msg = e.data;
    if (!msg) return;

    if (msg.type === "ready" || msg.type === "warmup-ok") {
      const entry = pending.get(msg.requestId);
      if (entry) {
        entry.resolve(msg);
        pending.delete(msg.requestId);
      }
      return;
    }

    if (msg.type === "error") {
      const entry = pending.get(msg.requestId);
      if (entry) {
        entry.reject(new Error(msg.message));
        pending.delete(msg.requestId);
      }
      return;
    }
  });

  worker.addEventListener("error", (err) => {
    // Fail tất cả promises đang chờ nếu worker lỗi
    for (const entry of pending.values()) {
      entry.reject(err);
    }
    pending.clear();
  });

  return worker;
}

function nextRequestId(): string {
  return String(nextId++);
}

export async function warmupPdfWorker(): Promise<void> {
  const w = getWorker();
  const requestId = nextRequestId();
  const msg: WarmupMessage = { type: "warmup", requestId };

  const res = await new Promise<WarmupOkResponse>((resolve, reject) => {
    pending.set(requestId, {
      resolve: (v) => resolve(v as WarmupOkResponse),
      reject,
    });
    w.postMessage(msg as IncomingMessage);
  });

  if (res.type !== "warmup-ok") {
    throw new Error("Worker warmup failed");
  }
}

export async function generatePdfArrayBuffer(
  payload: GeneratePayload
): Promise<ArrayBuffer> {
  const w = getWorker();
  const requestId = nextRequestId();
  const msg: GenerateMessage = { type: "generate", requestId, payload };

  const res = await new Promise<ReadyResponse>((resolve, reject) => {
    pending.set(requestId, {
      resolve: (v) => resolve(v as ReadyResponse),
      reject,
    });
    w.postMessage(msg as IncomingMessage);
  });

  if (res.type !== "ready") {
    throw new Error("Unexpected worker response");
  }
  return res.arrayBuffer;
}

export function downloadArrayBufferAsPdf(ab: ArrayBuffer, filename: string) {
  const blob = new Blob([ab], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export async function generateAndDownloadPdf(payload: GeneratePayload) {
  const ab = await generatePdfArrayBuffer(payload);
  downloadArrayBufferAsPdf(ab, payload.filename);
}
