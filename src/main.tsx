import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./lib/auth.tsx";
import "./index.css";
import { warmupPdfWorker } from "./lib/pdfWorkerClient";
import { injectSpeedInsights } from "@vercel/speed-insights";

// Initialize Vercel Speed Insights for Core Web Vitals monitoring
injectSpeedInsights();

// Preload the PDF worker and fonts at app bootstrap to eliminate first-click latency
warmupPdfWorker().catch(() => {});

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
