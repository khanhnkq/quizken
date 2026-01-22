import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  appType: "spa",
  publicDir: "public",

  server: {
    fs: {
      allow: [root],
    },
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },

  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    process.env.NODE_ENV === "analyze" &&
    visualizer({
      filename: "dist/bundle-analysis.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Optimized chunk splitting for better performance
        manualChunks(id) {
          if (!id) return;

          // Local icons - separate chunk
          if (
            id.includes("src/lib/icons") ||
            id.includes("/lib/icons") ||
            id.includes("@/lib/icons")
          ) {
            return "app-icons";
          }

          // Radix UI components - separate chunk
          if (id.includes("@radix-ui")) {
            return "radix-ui";
          }

          // React Hook Form + Zod - separate chunk
          if (id.includes("react-hook-form") || id.includes("zod")) {
            return "forms";
          }

          // GSAP - separate chunk (only loaded on desktop)
          if (id.includes("gsap")) {
            return "gsap";
          }

          // Framer Motion - separate chunk
          if (id.includes("framer-motion")) {
            return "animations";
          }

          // Charts (if used)
          if (id.includes("recharts")) {
            return "charts";
          }

          // Large data files - split by CEFR level for lazy loading
          if (id.includes("src/lib/constants/vocab/a1")) return "vocab-a1";
          if (id.includes("src/lib/constants/vocab/a2")) return "vocab-a2";
          if (id.includes("src/lib/constants/vocab/b1")) return "vocab-b1";
          if (id.includes("src/lib/constants/vocab/b2")) return "vocab-b2";
          if (id.includes("src/lib/constants/vocab/c1")) return "vocab-c1";
          if (id.includes("src/lib/constants/vocab/c2")) return "vocab-c2";
          
          // Other large data files
          if (id.includes("src/lib/constants/cefrVocabData")) return "cefr-vocab-data";
          if (id.includes("src/lib/constants/topicVocabData")) return "topic-vocab-data";
          if (id.includes("src/lib/constants/toeicData")) return "toeic-data";

          // 3D & Visualization
          if (id.includes("three") || id.includes("@react-three")) {
            return "three-js";
          }

          // PDF Generation
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "pdf-gen";
          }

          // Core vendor libraries
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },

        // Optimized file naming
        chunkFileNames: (chunkInfo) => {
          return "assets/[name]-[hash].js";
        },
      },
    },

    commonjsOptions: {
      transformMixedEsModules: true,
    },

    // Enable compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    exclude: [
      "gsap/ScrollTrigger",
      "gsap/dist/ScrollSmoother",
      "jspdf", // Exclude jspdf to prevent optimizer conflicts
    ],

    // Only include critical dependencies for initial load
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@/lib/icons",
      "@tanstack/react-query",
    ],
  },

  worker: {
    format: "es",
  },
});
