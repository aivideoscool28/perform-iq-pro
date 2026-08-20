import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

import { AppShell } from "@/components/athleticiq/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Loader2, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/coach")({
  component: CoachPage,
});

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text:
          "Hallo! Ich bin dein **Athletic IQ AI Coach**. Frag mich etwas zu deinem Training, Sprint, Hürden, Regeneration oder Wettkampf.",
      },
    ],
  },
];

function messageText(message: UIMessage) {
  return message.parts
    .map((part) =>
      part.type === "text" ? part.text : "",
    )
    .join("");
}

function CoachPage() {
  const [input, setInput] = useState("");

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    messages: INITIAL_MESSAGES,

    transport: new DefaultChatTransport({
      api: "/api/chat",

      headers: async () => {
        const { data } =
          await supabase.auth.getSession();

        const token =
          data.session?.access_token;

        if (!token) {
          throw new Error(
            "Keine aktive Supabase-Sitzung.",
          );
        }

        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),

    onError: (error) => {
      console.error(
        "AI Coach request failed:",
        error,
      );

      toast.error(
        error.message ||
          "KI-Coach konnte nicht antworten.",
      );
    },
  });

  const isLoading =
    status === "submitted" ||
    status === "streaming";

  const submit = async () => {
    const value = input.trim();

    if (!value || isLoading) {
      return;
    }

    setInput("");

    await sendMessage({
      text: value,
    });
  };

  const startNewChat = () => {
    if (isLoading) {
      return;
    }

    setMessages(INITIAL_MESSAGES);
    setInput("");
  };

  return (
    <AppShell
      title="KI-Coach"
      subtitle="Dein persönlicher Performance-Assistent"
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/10">
                <Brain className="h-5 w-5 text-accent" />
              </div>

              <div>
                <div className="font-bold">
                  Athletic IQ Coach
                </div>

                <div className="text-xs text-muted-foreground">
                  Status: {status}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={startNewChat}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Neuer Chat
            </Button>
          </div>

          <div className="h-[520px] overflow-y-auto p-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-muted/30",
                    ].join(" ")}
                  >
                    <ReactMarkdown>
                      {messageText(message)}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Coach analysiert…
                  </div>
                </div>
              )}
            </div>
          </div>

          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <Input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              disabled={isLoading}
              placeholder="Frag deinen Coach…"
              className="h-11"
            />

            <Button
              type="submit"
              disabled={
                isLoading ||
                !input.trim()
              }
              className="h-11"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
