import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const assetRoot = env.VITE_ASSET_ROOT;
  return {
    base: `/${assetRoot}/`,
    plugins: [react()],
    server: {
      host: true,
      port: 5001,
    },
  };
});
