import http from "node:http";
import { spawn } from "node:child_process";
// Explicitly isolated mocks: never forward requests to live Supabase or Gemini.
const athlete = "00000000-0000-0000-0000-000000000001",
  coach = "00000000-0000-0000-0000-000000000011";
const profile = (id) => ({
  id,
  display_name: id === coach ? "Test Coach" : "Test Athlete",
  role: id === coach ? "coach" : "athlete",
  age: 25,
  disciplines: ["Sprint"],
  goals: ["Improve"],
  goal_text: "Improve",
  experience: "Advanced",
  training_days_per_week: 4,
  training_setup: "Club",
  goal_motivation: ["Progress"],
  current_focus: ["Technique"],
  injuries: null,
  favourite_athlete: null,
  avatar_url: null,
  timezone: "Europe/Berlin",
  ai_consent: false,
  share_with_coach: true,
  onboarded_at: "2026-01-01T00:00:00Z",
  current_streak: 0,
  longest_streak: 0,
  invite_code: "local-test-code",
});
const profiles = new Map([
  [athlete, profile(athlete)],
  [coach, profile(coach)],
]);
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  const token = req.headers.authorization?.slice(7);
  let id;
  try {
    id = JSON.parse(Buffer.from(token.split(".")[1], "base64url")).sub;
  } catch {}
  const url = new URL(req.url, "http://127.0.0.1:8181");
  let body = "";
  for await (const chunk of req) body += chunk;
  res.setHeader("Content-Type", "application/json");
  if (url.pathname === "/auth/v1/user") {
    if (!profiles.has(id)) {
      res.writeHead(401).end('{"message":"Invalid token"}');
      return;
    }
    res.end(
      JSON.stringify({
        id,
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.invalid",
        user_metadata: {},
        app_metadata: {},
      }),
    );
    return;
  }
  if (url.pathname === "/auth/v1/logout") {
    res.writeHead(204).end();
    return;
  }
  if (url.pathname === "/rest/v1/profiles") {
    const filter = url.searchParams.get("id")?.replace(/^eq\./, "") ?? id;
    if (req.method === "PATCH" && filter === id) Object.assign(profiles.get(id), JSON.parse(body));
    const row = profiles.get(filter);
    res.end(JSON.stringify(req.headers.accept?.includes("object+json") ? row : row ? [row] : []));
    return;
  }
  if (url.pathname === "/rest/v1/rpc/consume_ai_usage") {
    res.writeHead(403).end('{"message":"AI_CONSENT_REQUIRED","code":"P0001"}');
    return;
  }
  if (url.pathname === "/rest/v1/rpc/fetch_friend_profiles") {
    res.end("[]");
    return;
  }
  if (url.pathname.startsWith("/rest/v1/")) {
    res.end(req.headers.accept?.includes("object+json") ? "null" : "[]");
    return;
  }
  res.writeHead(404).end('{"message":"Unmocked endpoint"}');
});
await new Promise((resolve) => server.listen(8181, "127.0.0.1", resolve));
const env = {
  ...process.env,
  SUPABASE_URL: "http://127.0.0.1:8181",
  SUPABASE_PUBLISHABLE_KEY: "isolated-test-publishable",
  VITE_SUPABASE_URL: "http://127.0.0.1:8181",
  VITE_SUPABASE_PUBLISHABLE_KEY: "isolated-test-publishable",
  GEMINI_API_KEY: "not-a-real-key",
};
const app = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8180", "--force"], {
  env,
  stdio: "inherit",
});
function stop() {
  app.kill("SIGTERM");
  server.close();
  setTimeout(() => process.exit(), 100).unref();
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
app.on("exit", stop);
