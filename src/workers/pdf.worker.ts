/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// jsPDF v3 is an ESM package. Import the named export directly.
import { jsPDF } from "jspdf";

//
// Giữ lại các import không liên quan đến jspdf (nếu có)
//

declare const self: DedicatedWorkerGlobalScope;
export { };

//
// ... Toàn bộ code còn lại của bạn (type Question, ...)
// ... sẽ hoạt động với biến 'jsPDF' (constructor) ở trên.
//

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
  locale?: string; // 'vi' or 'en'
}

// PDF Translations
const pdfTranslations: Record<string, Record<string, string>> = {
  vi: {
    description: "Mô tả:",
    downloaded: "Tải xuống:",
    result: "Kết quả:",
    explanation: "Giải thích:",
  },
  en: {
    description: "Description:",
    downloaded: "Downloaded:",
    result: "Result:",
    explanation: "Explanation:",
  },
};

const getPdfText = (locale: string | undefined, key: string) => {
  const lang = locale === 'en' ? 'en' : 'vi';
  return pdfTranslations[lang]?.[key] || pdfTranslations.vi[key] || key;
};

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

// DÙNG HÀM ĐÚNG NÀY
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const ensurePdfVnFont = async (doc: any) => {
  const g = globalThis as unknown as {
    __pdfVnFontDataReg?: string;
    __pdfVnFontDataBold?: string;
  };

  if (!g.__pdfVnFontDataReg) {
    const regCandidates = ["/fonts/vn/Roboto-Light.ttf"];
    for (const url of regCandidates) {
      try {
        const res = await fetch(url, { mode: "cors" });
        const contentType = res.headers.get("Content-Type") || "";
        if (!res.ok || contentType.includes("text/html")) {
          console.warn(
            "[PDF][Font] Failed (Not Font)",
            res.status,
            url,
            contentType
          );
          continue; // Bỏ qua nếu là file HTML
        }
        const buf = await res.arrayBuffer();
        g.__pdfVnFontDataReg = arrayBufferToBase64(buf);
        break;
      } catch {
        // thử candidate tiếp theo
      }
    }
  }

  if (!g.__pdfVnFontDataBold) {
    const boldCandidates = ["/fonts/vn/Roboto-Bold.ttf"];
    for (const url of boldCandidates) {
      try {
        const res = await fetch(url, { mode: "cors" });
        const contentType = res.headers.get("Content-Type") || "";
        if (!res.ok || contentType.includes("text/html")) {
          console.warn(
            "[PDF][Font] Failed (Not Font)",
            res.status,
            url,
            contentType
          );
          continue; // Bỏ qua nếu là file HTML
        }
        const buf = await res.arrayBuffer();
        g.__pdfVnFontDataBold = arrayBufferToBase64(buf);
        break;
      } catch {
        // thử candidate tiếp theo
      }
    }
  }

  if (g.__pdfVnFontDataReg) {
    doc.addFileToVFS("Roboto-Light.ttf", g.__pdfVnFontDataReg);
    try {
      doc.addFont("Roboto-Light.ttf", "Roboto", "normal", "Identity-H");
    } catch (e) {
      console.warn("[PDF][Font] addFont Roboto normal failed", e);
    }
    if (g.__pdfVnFontDataBold) {
      doc.addFileToVFS("Roboto-Bold.ttf", g.__pdfVnFontDataBold);
      try {
        doc.addFont("Roboto-Bold.ttf", "Roboto", "bold", "Identity-H");
      } catch (e) {
        console.warn("[PDF][Font] addFont Roboto bold failed", e);
      }
    }
    return true;
  }

  return false;
};

/**
 * Nạp động font CJK (Noto Sans) qua CDN và đăng ký vào VFS.
 * Tùy chọn nạp theo nhu cầu để giảm tải ban đầu.
 */
const ensurePdfCjkFonts = async (
  doc: any,
  opts?: { needSC?: boolean; needJP?: boolean; needKR?: boolean }
): Promise<{
  any: boolean;
  sc: boolean;
  jp: boolean;
  kr: boolean;
  scBold: boolean;
  jpBold: boolean;
  krBold: boolean;
}> => {
  const g = globalThis as unknown as {
    __pdfCjkFontDataSC?: string;
    __pdfCjkFontDataJP?: string;
    __pdfCjkFontDataKR?: string;
    __pdfCjkUrlSC?: string;
    __pdfCjkUrlJP?: string;
    __pdfCjkUrlKR?: string;
    __pdfCjkFontDataSCBold?: string;
    __pdfCjkFontDataJPBold?: string;
    __pdfCjkFontDataKRBold?: string;
    __pdfCjkUrlSCBold?: string;
    __pdfCjkUrlJPBold?: string;
    __pdfCjkUrlKRBold?: string;
  };

  const shouldLoadAll = !opts || (!opts.needSC && !opts.needJP && !opts.needKR);

  const fetchFont = async (
    candidates: string[]
  ): Promise<{ data: string; url: string } | undefined> => {
    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          mode: "cors",
        });
        const contentType = res.headers.get("Content-Type") || "";
        if (!res.ok || contentType.includes("text/html")) {
          console.warn(
            "[PDF][Font] Failed (Not Font)",
            res.status,
            url,
            contentType
          );
          continue; // Bỏ qua nếu là file HTML
        }
        const buf = await res.arrayBuffer();
        console.info("[PDF][Font] Loaded", url);
        return { data: arrayBufferToBase64(buf), url };
      } catch (e) {
        console.warn("[PDF][Font] Failed", url, e);
      }
    }
    console.error("[PDF][Font] All candidates failed");
    return undefined;
  };

  const verifyFontRegistered = (
    family: string,
    style: "normal" | "bold" = "normal"
  ) => {
    try {
      const list = doc.getFontList() as Record<string, string[]>;
      return !!(list[family] && list[family].includes(style));
    } catch {
      // Một số build có thể không expose getFontList; giả định ok để không chặn flow
      return true;
    }
  };

  let sc = false,
    jp = false,
    kr = false,
    scBold = false,
    jpBold = false,
    krBold = false;

  // Simplified Chinese (SC)
  if (shouldLoadAll || opts?.needSC) {
    if (!g.__pdfCjkFontDataSC) {
      const scCandidates = ["/fonts/cjk/NotoSansSC-Regular.ttf"];
      const res = await fetchFont(scCandidates);
      if (res) {
        g.__pdfCjkFontDataSC = res.data;
        g.__pdfCjkUrlSC = res.url;
      }
    }
    if (g.__pdfCjkFontDataSC) {
      const fileName =
        g.__pdfCjkUrlSC && g.__pdfCjkUrlSC.endsWith(".otf")
          ? "NotoSansSC-Regular.otf"
          : "NotoSansSC-Regular.ttf";
      doc.addFileToVFS(fileName, g.__pdfCjkFontDataSC);
      try {
        doc.addFont(fileName, "NotoSansSC", "normal", "Identity-H");
      } catch (e) {
        console.warn("[PDF][Font] addFont SC failed", e);
      }
      sc = verifyFontRegistered("NotoSansSC", "normal");
      if (!sc) {
        console.warn("[PDF][Font] Verify failed, disable SC");
      }

      // Try load Bold variant (local only)
      if (!g.__pdfCjkFontDataSCBold) {
        const scBoldCandidates = ["/fonts/cjk/NotoSansSC-Bold.ttf"];
        const resBold = await fetchFont(scBoldCandidates);
        if (resBold) {
          g.__pdfCjkFontDataSCBold = resBold.data;
          g.__pdfCjkUrlSCBold = resBold.url;
        }
      }
      if (g.__pdfCjkFontDataSCBold) {
        const fileNameBold =
          g.__pdfCjkUrlSCBold && g.__pdfCjkUrlSCBold.endsWith(".otf")
            ? "NotoSansSC-Bold.otf"
            : "NotoSansSC-Bold.ttf";
        doc.addFileToVFS(fileNameBold, g.__pdfCjkFontDataSCBold);
        try {
          doc.addFont(fileNameBold, "NotoSansSC", "bold", "Identity-H");
        } catch (e) {
          console.warn("[PDF][Font] addFont SC bold failed", e);
        }
        scBold = verifyFontRegistered("NotoSansSC", "bold");
      }
    }
  }

  // Japanese (JP)
  if (shouldLoadAll || opts?.needJP) {
    if (!g.__pdfCjkFontDataJP) {
      const jpCandidates = ["/fonts/cjk/NotoSansJP-Regular.ttf"];
      const res = await fetchFont(jpCandidates);
      if (res) {
        g.__pdfCjkFontDataJP = res.data;
        g.__pdfCjkUrlJP = res.url;
      }
    }
    if (g.__pdfCjkFontDataJP) {
      const fileName =
        g.__pdfCjkUrlJP && g.__pdfCjkUrlJP.endsWith(".otf")
          ? "NotoSansJP-Regular.otf"
          : "NotoSansJP-Regular.ttf";
      doc.addFileToVFS(fileName, g.__pdfCjkFontDataJP);
      try {
        doc.addFont(fileName, "NotoSansJP", "normal", "Identity-H");
      } catch (e) {
        console.warn("[PDF][Font] addFont JP failed", e);
      }
      jp = verifyFontRegistered("NotoSansJP", "normal");
      if (!jp) {
        console.warn("[PDF][Font] Verify failed, disable JP");
      }

      // Try load Bold variant (local only)
      if (!g.__pdfCjkFontDataJPBold) {
        const jpBoldCandidates = ["/fonts/cjk/NotoSansJP-Bold.ttf"];
        const resBold = await fetchFont(jpBoldCandidates);
        if (resBold) {
          g.__pdfCjkFontDataJPBold = resBold.data;
          g.__pdfCjkUrlJPBold = resBold.url;
        }
      }
      if (g.__pdfCjkFontDataJPBold) {
        const fileNameBold =
          g.__pdfCjkUrlJPBold && g.__pdfCjkUrlJPBold.endsWith(".otf")
            ? "NotoSansJP-Bold.otf"
            : "NotoSansJP-Bold.ttf";
        doc.addFileToVFS(fileNameBold, g.__pdfCjkFontDataJPBold);
        try {
          doc.addFont(fileNameBold, "NotoSansJP", "bold", "Identity-H");
        } catch (e) {
          console.warn("[PDF][Font] addFont JP bold failed", e);
        }
        jpBold = verifyFontRegistered("NotoSansJP", "bold");
      }
    }
  }

  // Korean (KR)
  if (shouldLoadAll || opts?.needKR) {
    if (!g.__pdfCjkFontDataKR) {
      const krCandidates = ["/fonts/cjk/NotoSansKR-Regular.ttf"];
      const res = await fetchFont(krCandidates);
      if (res) {
        g.__pdfCjkFontDataKR = res.data;
        g.__pdfCjkUrlKR = res.url;
      }
    }
    if (g.__pdfCjkFontDataKR) {
      const fileName =
        g.__pdfCjkUrlKR && g.__pdfCjkUrlKR.endsWith(".otf")
          ? "NotoSansKR-Regular.otf"
          : "NotoSansKR-Regular.ttf";
      doc.addFileToVFS(fileName, g.__pdfCjkFontDataKR);
      try {
        doc.addFont(fileName, "NotoSansKR", "normal", "Identity-H");
      } catch (e) {
        console.warn("[PDF][Font] addFont KR failed", e);
      }
      kr = verifyFontRegistered("NotoSansKR", "normal");
      if (!kr) {
        console.warn("[PDF][Font] Verify failed, disable KR");
      }

      // Try load Bold variant (local only)
      if (!g.__pdfCjkFontDataKRBold) {
        const krBoldCandidates = ["/fonts/cjk/NotoSansKR-Bold.ttf"];
        const resBold = await fetchFont(krBoldCandidates);
        if (resBold) {
          g.__pdfCjkFontDataKRBold = resBold.data;
          g.__pdfCjkUrlKRBold = resBold.url;
        }
      }
      if (g.__pdfCjkFontDataKRBold) {
        const fileNameBold =
          g.__pdfCjkUrlKRBold && g.__pdfCjkUrlKRBold.endsWith(".otf")
            ? "NotoSansKR-Bold.otf"
            : "NotoSansKR-Bold.ttf";
        doc.addFileToVFS(fileNameBold, g.__pdfCjkFontDataKRBold);
        try {
          doc.addFont(fileNameBold, "NotoSansKR", "bold", "Identity-H");
        } catch (e) {
          console.warn("[PDF][Font] addFont KR bold failed", e);
        }
        krBold = verifyFontRegistered("NotoSansKR", "bold");
      }
    }
  }

  return { any: sc || jp || kr, sc, jp, kr, scBold, jpBold, krBold };
};

/** Phát hiện script trong một chuỗi để chọn font CJK phù hợp */
const detectScript = (text: string) => {
  // Han (CJK Unified Ideographs)
  const hasHan = /[\u4E00-\u9FFF]/u.test(text);
  // Hiragana + Katakana + halfwidth katakana
  const hasKana =
    /[\u3040-\u30FF]/u.test(text) || /[\uFF66-\uFF9D]/u.test(text);
  // Hangul syllables
  const hasHangul = /[\uAC00-\uD7AF]/u.test(text);
  // Latin letters (basic)
  const hasLatin = /[A-Za-z]/.test(text);
  return { hasHan, hasKana, hasHangul, hasLatin };
};

/** Chọn font theo nội dung dòng; ưu tiên JP > KR > SC; ngược lại dùng base */
const chooseFontFamily = (
  text: string,
  cjk: {
    any: boolean;
    sc: boolean;
    jp: boolean;
    kr: boolean;
    scBold?: boolean;
    jpBold?: boolean;
    krBold?: boolean;
  },
  baseFont: string
): string => {
  if (!cjk.any) return baseFont;
  const s = detectScript(text);
  // Nhật: cần Kana
  if (s.hasKana && cjk.jp) return "NotoSansJP";
  // Hàn: cần Hangul
  if (s.hasHangul && cjk.kr) return "NotoSansKR";
  // Hán tự: ưu tiên SC, sau đó fallback JP rồi KR nếu có
  if (s.hasHan) {
    if (cjk.sc) return "NotoSansSC";
    if (cjk.jp) return "NotoSansJP";
    if (cjk.kr) return "NotoSansKR";
  }
  // Mặc định Latin/Việt/Anh
  return baseFont;
};

/** Quét payload để xác định cần nạp font CJK nào */
const preScanPayloadForScripts = (payload: GeneratePayload) => {
  let needSC = false;
  let needJP = false;
  let needKR = false;
  const pushText = (t?: string) => {
    if (!t) return;
    const s = detectScript(t);
    needJP = needJP || s.hasKana;
    needKR = needKR || s.hasHangul;
    needSC = needSC || s.hasHan;
  };
  pushText(payload.title);
  pushText(payload.description);
  (payload.questions || []).forEach((q) => {
    pushText(q.question);
    (q.options || []).forEach((opt) => pushText(opt));
    pushText(q.explanation);
  });
  return { needSC, needJP, needKR };
};

const buildPdfArrayBuffer = async (
  payload: GeneratePayload
): Promise<ArrayBuffer> => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const vnFontReady = await ensurePdfVnFont(doc);
  const BASE_FONT_FAMILY = vnFontReady ? "Roboto" : "helvetica";
  // Pre-scan nội dung để nạp đúng font CJK cần thiết
  const needs = preScanPayloadForScripts(payload);
  const cjk = await ensurePdfCjkFonts(doc, needs);

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
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.55;
    lines.forEach((line: string) => {
      addPageIfNeeded(lineHeight);
      const family = chooseFontFamily(line, cjk, BASE_FONT_FAMILY);
      const style: "normal" | "bold" = (() => {
        if (family === BASE_FONT_FAMILY) return fontStyle;
        if (fontStyle === "bold") {
          if (family === "NotoSansJP" && cjk.jpBold) return "bold";
          if (family === "NotoSansKR" && cjk.krBold) return "bold";
          if (family === "NotoSansSC" && cjk.scBold) return "bold";
        }
        return "normal";
      })();
      try {
        doc.setFont(family, style);
      } catch (e) {
        console.warn("[PDF][Font] setFont failed for", family, style, e);
        doc.setFont(BASE_FONT_FAMILY, fontStyle);
      }
      doc.text(line, marginX, y);
      y += lineHeight;
    });
    y += gapAfter;
  };

  // Header
  addBlock(payload.title || "quiz", 16, "bold", 2);
  if (payload.description) {
    addBlock(`${getPdfText(payload.locale, 'description')} ${payload.description}`, 10, "normal", 4);
  }
  const dateLocale = payload.locale === 'en' ? 'en-US' : 'vi-VN';
  addBlock(`${getPdfText(payload.locale, 'downloaded')} ${new Date().toLocaleString(dateLocale)}`, 10, "normal", 4);

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
    addBlock(`${getPdfText(payload.locale, 'result')} ${correct}/${total} (${percent}%)`, 12, "bold", 4);
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
      addBlock(`${getPdfText(payload.locale, 'explanation')} ${q.explanation}`, 10, "normal", 4);
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
  // Prewarm CJK fonts (có thể tải lớn lần đầu)
  await ensurePdfCjkFonts(doc);
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
