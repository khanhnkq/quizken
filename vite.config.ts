import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

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

  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // ĐƠN GIẢN HÓA: gom tất cả node_modules vào chung "vendor"
        // để đảm bảo React và các thư viện phụ thuộc được tải cùng lúc,
        // tránh lỗi runtime undefined (ví dụ `.memo` / `forwardRef`).
        manualChunks(id) {
          if (!id) return;

          // Local icons - vẫn tách để có thể load sau nếu cần
          if (
            id.includes("src/lib/icons") ||
            id.includes("/lib/icons") ||
            id.includes("@/lib/icons")
          ) {
            return "app-icons";
          }

          // Gom tất cả package trong node_modules vào vendor duy nhất
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },

        // Giữ cấu trúc tên tệp tĩnh
        chunkFileNames: (chunkInfo) => {
          return "assets/[name]-[hash].js";
        },
      },
    },

    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
    exclude: ["gsap/ScrollTrigger", "gsap/dist/ScrollSmoother"],

    // ✅ Chỉ include những gì thực sự cần
    // Force prebundle local icons cùng với react để tránh race condition khi load forwardRef
    include: ["react", "react-dom", "react/jsx-runtime", "@/lib/icons"],

    // ✅ THÊM: Force deps được bundle đúng cách
    force: true,
  },

  worker: {
    format: "es",
  },
});
