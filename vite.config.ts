import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: "site",
  build: {
    outDir: "../dist",
  },
  plugins: [react()],
});
