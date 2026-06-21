import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Brain, Zap, Target, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/coach")({ component: Page });

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text:
          "Guten Morgen! Ich bin dein **Athleticiq KI-Coach**. Frag mich alles zu Training, Regeneration, Technik oder Wettkampf — ich helfe dir, dein nächstes Level zu erreichen. 💪",
      },
    ],
  },
];

const suggestions = [
  "Warum ist mein Ruhepuls heute höher?",
  "Erkläre mir eine gute Sprint-Aufwärmroutine.",
  "Plane einen Deload für nächste Woche.",
  "Was sollte ich vor dem Wettkampf essen?",
];

function messageText(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function Page() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    messages: INITIAL_MESSAGES,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message || "KI-Coach nicht erreichbar"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <AppShell
      title="KI-Coach"
      subtitle="Dein persönlicher Performance-Assistent"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "KI-Coach" }]}
    >
      <EditableShell storageKey="athleticiq.edit.coach.v1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-strong rounded-3xl p-6 flex flex-col h-[640px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-violet">
                  <Brain className="h-5 w-5 text-background" />
                </div>
                <div>
                  <div className="text-sm font-bold">Athleticiq Coach</div>
                  <div className="text-[11px] text-neon-cyan flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-dot" />
                    {isLoading ? "Denkt nach…" : "Online · Lovable AI"}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-neon-violet/40 text-neon-violet">Pro</Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-gradient-to-br from-neon-cyan/25 to-neon-violet/20 border border-neon-cyan/30"
                        : "glass border-border/50",
                    ].join(" ")}
                  >
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                      <ReactMarkdown>{messageText(m)}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="glass border-border/50 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coach analysiert…
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  disabled={isLoading}
                  onClick={() => submit(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-white/[0.02] hover:border-neon-cyan/40 hover:text-neon-cyan transition disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Frag deinen Coach…"
                disabled={isLoading}
                className="bg-white/[0.03] border-border/60 h-11"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-violet/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon-violet">
                  <Sparkles className="h-3.5 w-3.5" /> Heute fokussiert auf
                </div>
                <h3 className="text-lg font-bold mt-1">Sprint-Mechanik</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Basierend auf deiner letzten Videoanalyse arbeiten wir an vollständiger Hüftstreckung
                  und kürzerer Bodenkontaktzeit.
                </p>
              </div>
            </div>

            {[
              { icon: Zap, title: "Action", text: "A-Skips 3 × 20 m vor der Hauptserie hinzufügen." },
              { icon: Target, title: "Diese Woche", text: "Sprung-Liegestütze für Reaktivität einbauen." },
              { icon: MessageSquare, title: "Reflexion", text: "Notiere Schlafqualität direkt nach dem Aufstehen." },
            ].map((c) => (
              <div key={c.title} className="glass rounded-2xl p-4 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 grid place-items-center">
                  <c.icon className="h-4 w-4 text-neon-cyan" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</div>
                  <div className="text-sm mt-0.5">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </EditableShell>
    </AppShell>
  );
}
