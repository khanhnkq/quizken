/// <reference lib="webworker" />
import jsPDF from "jspdf";

declare const self: DedicatedWorkerGlobalScope;
export {};

type Question = {
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
};

interface GeneratePayload {
  filename: string;
  title: string;
  description?: string;
  questions: Question[];
  showResults: boolean;
  userAnswers?: number[];
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

const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...chunk);
  }
  return binary;
};

const ensurePdfVnFont = async (doc: jsPDF) => {
  const g = globalThis as unknown as {
    __pdfVnFontDataReg?: string;
    __pdfVnFontDataBold?: string;
  };

  if (!g.__pdfVnFontDataReg) {
    const regCandidates = [
      "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Regular.ttf",
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Regular.ttf",
      "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
    ];
    for (const url of regCandidates) {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        g.__pdfVnFontDataReg = arrayBufferToBinaryString(buf);
        break;
      } catch {
        // thử candidate tiếp theo
      }
    }
  }

  if (!g.__pdfVnFontDataBold) {
    const boldCandidates = [
      "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Bold.ttf",
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Bold.ttf",
      "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
    ];
    for (const url of boldCandidates) {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        g.__pdfVnFontDataBold = arrayBufferToBinaryString(buf);
        break;
      } catch {
        // thử candidate tiếp theo
      }
    }
  }

  if (g.__pdfVnFontDataReg) {
    doc.addFileToVFS("Roboto-Regular.ttf", g.__pdfVnFontDataReg);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    if (g.__pdfVnFontDataBold) {
      doc.addFileToVFS("Roboto-Bold.ttf", g.__pdfVnFontDataBold);
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    }
    return true;
  }

  return false;
};

const buildPdfArrayBuffer = async (
  payload: GeneratePayload
): Promise<ArrayBuffer> => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const vnFontReady = await ensurePdfVnFont(doc);
  const FONT_FAMILY = vnFontReady ? "Roboto" : "helvetica";

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const marginTop = 15;
  const marginBottom = 15;
  const contentWidth = pageWidth - marginX * 2;
  let y = marginTop;

  const addPageIfNeeded = (increment: number) => {
    if (y + increment > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const addBlock = (
    text: string,
    fontSize = 11,
    fontStyle: "normal" | "bold" = "normal",
    gapAfter = 3
  ) => {
    doc.setFont(FONT_FAMILY, fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.55;
    lines.forEach((line: string) => {
      addPageIfNeeded(lineHeight);
      doc.text(line, marginX, y);
      y += lineHeight;
    });
    y += gapAfter;
  };

  // Header
  addBlock(payload.title || "quiz", 16, "bold", 2);
  if (payload.description) {
    addBlock(`Mô tả: ${payload.description}`, 10, "normal", 4);
  }
  addBlock(`Tải xuống: ${new Date().toLocaleString("vi-VN")}`, 10, "normal", 4);

  // Divider
  addPageIfNeeded(2);
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 4;

  // Score (nếu có)
  if (payload.showResults) {
    const total = (payload.questions || []).length;
    let correct = 0;
    (payload.userAnswers || []).forEach((answer, idx) => {
      if (answer === payload.questions[idx]?.correctAnswer) correct++;
    });
    const percent = total ? Math.round((correct / total) * 100) : 0;
    addBlock(`Kết quả: ${correct}/${total} (${percent}%)`, 12, "bold", 4);
  }

  // Questions
  (payload.questions || []).forEach((q, idx) => {
    if (!q) return;

    // Question line
    addBlock(`${idx + 1}. ${q.question}`, 11, "bold", 2);

    // Options
    (q.options || []).forEach((opt, i) => {
      const isCorrect = payload.showResults ? i === q.correctAnswer : false;
      const userSelected = payload.showResults
        ? (payload.userAnswers || [])[idx] === i
        : false;
      const prefix = String.fromCharCode(65 + i) + ". ";
      let suffix = "";
      if (payload.showResults) {
        if (isCorrect) suffix = "  ✓";
        else if (userSelected && !isCorrect) suffix = "  ✗";
      }
      addBlock(`${prefix}${opt}${suffix}`, 11, "normal", 1);
    });

    // Explanation
    if (payload.showResults && q.explanation) {
      addBlock(`Giải thích: ${q.explanation}`, 10, "normal", 4);
    } else {
      y += 2;
    }
  });

  return doc.output("arraybuffer") as ArrayBuffer;
};

// Warm up by preloading fonts to cache inside worker global
const warmupFonts = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await ensurePdfVnFont(doc);
};

self.addEventListener("message", async (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data;
  if (!msg) return;

  try {
    if (msg.type === "warmup") {
      await warmupFonts();
      const res: WarmupOkResponse = {
        type: "warmup-ok",
        requestId: msg.requestId,
      };
      self.postMessage(res);
      return;
    }

    if (msg.type === "generate") {
      const { payload, requestId } = msg;
      const ab = await buildPdfArrayBuffer(payload);
      const res: ReadyResponse = {
        type: "ready",
        requestId,
        arrayBuffer: ab,
        fileName: payload.filename,
      };
      // Transfer ArrayBuffer to avoid copy
      self.postMessage(res as OutgoingMessage, [ab as unknown as Transferable]);
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const requestId = (msg as { requestId?: string }).requestId || "unknown";
    const res: ErrorResponse = { type: "error", requestId, message };
    self.postMessage(res);
  }
});
