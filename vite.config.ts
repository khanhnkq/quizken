import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

// Định nghĩa thư mục root của dự án
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // THAY ĐỔI ĐỂ KIỂM TRA:
  // Tạm thời chuyển sang 'mpa' (Multi-Page App) để TẮT
  // tính năng SPA fallback (trả về index.html cho mọi đường dẫn).
  // Nếu cách này sửa được lỗi font, nó xác nhận
  // middleware của Vite đang chạy sai thứ tự.
  appType: "spa",

  // THÊM DÒNG NÀY (để chỉ định rõ ràng)
  publicDir: "public",

  // THÊM KHỐI 'server' NÀY
  server: {
    fs: {
      // Chỉ định rõ ràng rằng server được phép
      // phục vụ file từ toàn bộ thư mục root
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
    // Tăng ngưỡng cảnh báo chunk lớn (KB)
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Gom các thư viện nặng vào các chunk riêng để giảm initial bundle
        manualChunks(id) {
          // Disabled manual chunking to simplify debugging — re-enable after fix
          return undefined;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    // Tránh pre-bundle các GSAP plugins nặng vào initial deps
    exclude: ["gsap/ScrollTrigger", "gsap/dist/ScrollSmoother"],

    // Buộc Vite pre-bundle file UMD của jsPDF
    include: [
      "jspdf/dist/jspdf.umd.min.js",
      "@radix-ui/react-icons",
      "react",
      "react-dom",
    ],
  },
  worker: {
    format: "es",
  },
});
