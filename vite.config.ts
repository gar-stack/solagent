import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const NODE_MODULES_PATH = "node_modules/";
const SOLANA_CORE_PACKAGES = new Set([
  "@solana/web3.js",
  "@solana/spl-token",
  "@noble/curves",
  "@noble/hashes",
  "tweetnacl",
  "bs58",
  "buffer",
  "base-x",
  "bn.js",
  "borsh",
]);

function getPackageName(id: string): string | undefined {
  const modulePathIndex = id.lastIndexOf(NODE_MODULES_PATH);
  if (modulePathIndex === -1) return undefined;

  const modulePath = id.slice(modulePathIndex + NODE_MODULES_PATH.length);
  const segments = modulePath.split("/");
  const [scopeOrName, maybeName] = segments;

  if (!scopeOrName) return undefined;
  if (scopeOrName.startsWith("@") && maybeName) {
    return `${scopeOrName}/${maybeName}`;
  }
  return scopeOrName;
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes(NODE_MODULES_PATH)) return undefined;
          const packageName = getPackageName(id);
          if (!packageName) return undefined;

          if (
            packageName === "recharts" ||
            packageName.startsWith("d3-") ||
            packageName.startsWith("victory-")
          ) {
            return "vendor-charts";
          }

          if (SOLANA_CORE_PACKAGES.has(packageName)) {
            return "vendor-solana";
          }

          if (packageName.startsWith("@solana/wallet-adapter")) {
            return "vendor-wallet";
          }

          if (
            packageName === "react-router-dom" ||
            packageName === "react-router" ||
            packageName === "@remix-run/router"
          ) {
            return "vendor-router";
          }

          if (
            packageName.startsWith("@radix-ui/") ||
            packageName === "lucide-react" ||
            packageName === "sonner"
          ) {
            return "vendor-ui";
          }

          if (packageName === "date-fns") return "vendor-date";
          return undefined;
        },
      },
    },
  },
});
