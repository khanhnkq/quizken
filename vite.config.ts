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
  },
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    // Tăng ngưỡng cảnh báo chunk lớn (KB)
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Gom các thư viện nặng vào các chunk riêng để giảm initial bundle
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("/react/")) return "vendor";
            if (id.includes("react-dom")) return "vendor";
            if (id.includes("@tanstack/")) return "react-query";
            if (id.includes("react-router")) return "router";
            if (id.includes("framer-motion")) return "framer";
            if (id.includes("gsap")) return "gsap";
            if (id.includes("three")) return "three";
            if (id.includes("@radix-ui")) return "vendor";
            if (id.includes("lucide-react")) return "vendor";
            if (id.includes("date-fns")) return "date-fns";
            if (id.includes("recharts")) return "charts";
            if (id.includes("@supabase/supabase-js")) return "supabase";
          }
          // Nhóm theo khu vực mã nguồn để chunk rõ ràng hơn
          if (id.includes("/src/components/ui/")) return "ui-kit";
          if (id.includes("/src/components/library/")) return "library";
          if (id.includes("/src/components/sections/")) return "sections";
          if (id.includes("/src/workers/")) return "workers";
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    // Tránh pre-bundle các GSAP plugins nặng vào initial deps
    exclude: ["gsap/ScrollTrigger", "gsap/dist/ScrollSmoother"],

    // THÊM DÒNG NÀY (để buộc Vite pre-bundle file UMD) và đảm bảo lucide-react được pre-bundle cùng React
    include: ["jspdf/dist/jspdf.umd.min.js", "lucide-react"],
  },
  worker: {
    format: "es",
  },
});
