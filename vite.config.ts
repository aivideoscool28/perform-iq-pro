// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect GitHub Codespaces
const isCodespace = !!process.env.CODESPACE_NAME;

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    server: {
      // Override Lovable's sandbox detection for GitHub Codespaces
      host: true,          // listen on 0.0.0.0 so Codespaces can forward the port
      port: 5173,          // standard Vite port
      strictPort: false,   // fall back to next free port if 5173 is taken

      // HMR needs to point at the public Codespaces URL, not localhost
      hmr: isCodespace
        ? {
            protocol: "wss",
            host: `${process.env.CODESPACE_NAME}-5173.app.github.dev`,
            clientPort: 443,
          }
        : undefined,

      warmup: {
        clientFiles: [
          "./src/routes/index.tsx",
          "./src/components/athleticiq/AppShell.tsx",
          "./src/components/athleticiq/Sidebar.tsx",
          "./src/components/dashboard/TodaysTrainingCard.tsx",
          "./src/components/dashboard/DashboardCheckinCard.tsx",
          "./src/components/dashboard/WeeklyProgressCards.tsx",
          "./src/components/dashboard/KIInsightCard.tsx",
        ],
      },
    },
  },
});