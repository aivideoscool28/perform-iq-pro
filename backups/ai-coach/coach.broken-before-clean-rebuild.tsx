import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Sparkles,
  Send,
  Brain,
  Plus,
  MessageSquare,
  Loader2,
  History,
} from "lucide-react";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/coach")({
  component: Page,
});

// ==========================================================
// TYPES
// ==========================================================

// One row from the ai_conversations table.
// This is used for the conversation-history list.
type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

// ==========================================================
// DEFAULT / WELCOME MESSAGE
// ==========================================================

// This message is shown for a completely new chat.
// It is UI-only and is NOT stored in ai_messages.
const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text:
          "Guten Morgen! Ich bin dein **Athletic IQ AI Coach**. Frag mich alles zu Training, Regeneration, Technik oder Wettkampf — ich helfe dir, dein nächstes Level zu erreichen. 💪",
      },
    ],
  },
];

const suggestions = [
  "Warum ist mein Ruhepuls heute höher?",
  "Wie funktioniert Athletic IQ?",
  "Erkläre mir eine gute Sprint-Aufwärmroutine.",
  "Plane einen Deload für nächste Woche.",
  "Was sollte ich vor dem Wettkampf essen?",
];

// ==========================================================
// MESSAGE HELPER
// ==========================================================

// useChat stores message text inside `parts`.
// This helper converts those parts into one normal string.
//
// We use this when:
// 1. Rendering Markdown.
// 2. Saving completed Athletic IQ AI answers to Supabase.
function messageText(message: UIMessage) {
  return message.parts
    .map((part) =>
      part.type === "text" ? part.text : "",
    )
    .join("");
}

// ==========================================================
// PAGE
// ==========================================================

function Page() {
  // --------------------------------------------------------
  // NORMAL UI STATE
  // --------------------------------------------------------

  const [input, setInput] = useState("");

  // --------------------------------------------------------
  // CONVERSATION PERSISTENCE STATE
  // --------------------------------------------------------

  // ID of the conversation that is currently open.
  //
  // null = new chat that has not been saved yet.
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  // A ref is also used because onFinish() needs access to
  // the current conversation ID after Gemini finishes streaming.
  const conversationIdRef =
    useRef<string | null>(null);

  // List shown under "Vergangene Chats".
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  // Loading state while previous chats are retrieved.
  const [historyLoading, setHistoryLoading] =
    useState(true);

  // Loading state while one previous conversation is opened.
  const [conversationLoading, setConversationLoading] =
    useState(false);

  // ========================================================
  // AI CHAT
  // ========================================================

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    messages: INITIAL_MESSAGES,

    // Gemini still streams through our existing /api/chat route.
    transport: new DefaultChatTransport({
      api: "/api/chat",

      // Before every AI Coach request, get the latest Supabase session.
      // We send ONLY the access token to /api/chat.
      // The server will verify this token and determine the real userId.
      headers: async () => {
        const { data } = await supabase.auth.getSession();

        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error("No authenticated Supabase session.");
        }

        return {
          Authorization: `Bearer ${accessToken}`,
        };
      },
    }),

    // ======================================================
    // SAVE COMPLETED ATHLETIC IQ AI MESSAGE
    // ======================================================
    //
    // This runs after Gemini has finished streaming.
    // At this point we have the complete assistant message,
    // so we save it permanently in ai_messages.

    onFinish: async ({ message }) => {
      const activeConversationId =
        conversationIdRef.current;

      if (!activeConversationId) {
        console.error(
          "No active conversation ID for assistant message.",
        );
        return;
      }

      const content = messageText(message).trim();

      if (!content) return;

      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        console.error(
          "No authenticated user while saving assistant message.",
        );
        return;
      }

      const { error: messageError } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: activeConversationId,
          user_id: user.id,
          role: "assistant",
          content,
        });

      if (messageError) {
        console.error(
          "AI assistant message save failed:",
          messageError,
        );

        toast.error(
          "KI-Antwort konnte nicht gespeichert werden.",
        );

        return;
      }

      // Update the conversation timestamp.
      // This makes recently used conversations appear first.
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("ai_conversations")
        .update({
          updated_at: now,
        })
        .eq("id", activeConversationId);

      if (updateError) {
        console.error(
          "Conversation timestamp update failed:",
          updateError,
        );
      }

      // Move the active conversation to the top locally too.
      setConversations((current) => {
        const target = current.find(
          (conversation) =>
            conversation.id === activeConversationId,
        );

        if (!target) return current;

        return [
          {
            ...target,
            updated_at: now,
          },
          ...current.filter(
            (conversation) =>
              conversation.id !== activeConversationId,
          ),
        ];
      });
    },

    onError: (error) => {
      toast.error(
        error.message ||
          "KI-Coach nicht erreichbar",
      );
    },
  });

  const isLoading =
    status === "submitted" ||
    status === "streaming";

  // ========================================================
  // LOAD CONVERSATION HISTORY
  // ========================================================
  //
  // When the AI Coach page opens:
  //
  // Supabase
  //   ↓
  // ai_conversations
  //   ↓
  // show previous conversations in sidebar.

  useEffect(() => {
    const loadConversations = async () => {
      setHistoryLoading(true);

      try {
        const { data: sessionData } =
          await supabase.auth.getSession();

        const user = sessionData.session?.user;

        if (!user) {
          setConversations([]);
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("ai_conversations")
          .select(
            "id, title, created_at, updated_at",
          )
          .eq("user_id", user.id)
          .order("updated_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        setConversations(
          (data ?? []) as Conversation[],
        );
      } catch (error) {
        console.error(
          "Conversation history load failed:",
          error,
        );

        toast.error(
          "Vergangene Chats konnten nicht geladen werden.",
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadConversations();
  }, []);

  // ========================================================
  // OPEN AN EXISTING CONVERSATION
  // ========================================================
  //
  // Example:
  //
  // Athlete clicks "Sprint Start verbessern"
  //        ↓
  // read ai_messages
  //        ↓
  // convert database rows → UIMessage[]
  //        ↓
  // setMessages(...)
  //        ↓
  // previous chat appears again.

  const openConversation = async (
    selectedConversation: Conversation,
  ) => {
    if (isLoading || conversationLoading) {
      return;
    }

    setConversationLoading(true);
    setInput("");

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        toast.error(
          "Du musst angemeldet sein.",
        );
        return;
      }

      const {
        data: storedMessages,
        error,
      } = await supabase
        .from("ai_messages")
        .select(
          "id, role, content, created_at",
        )
        .eq(
          "conversation_id",
          selectedConversation.id,
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      // Convert our PostgreSQL message rows back into
      // the UIMessage format expected by useChat.
      const restoredMessages: UIMessage[] =
        (storedMessages ?? [])
          .filter(
            (row) =>
              row.role === "user" ||
              row.role === "assistant",
          )
          .map((row) => ({
            id: row.id,
            role: row.role as
              | "user"
              | "assistant",
            parts: [
              {
                type: "text" as const,
                text: row.content,
              },
            ],
          }));

      // Tell useChat which messages should now appear.
      setMessages(
        restoredMessages.length > 0
          ? restoredMessages
          : INITIAL_MESSAGES,
      );

      // Important:
      // Any NEW messages now belong to THIS conversation.
      setConversationId(
        selectedConversation.id,
      );

      conversationIdRef.current =
        selectedConversation.id;
    } catch (error) {
      console.error(
        "Conversation load failed:",
        error,
      );

      toast.error(
        "Chat konnte nicht geöffnet werden.",
      );
    } finally {
      setConversationLoading(false);
    }
  };

  // ========================================================
  // START A NEW CHAT
  // ========================================================
  //
  // We do NOT immediately insert an empty conversation.
  //
  // Instead:
  //
  // New Chat clicked
  //      ↓
  // conversationId = null
  //      ↓
  // user sends first real message
  //      ↓
  // THEN create ai_conversations row.
  //
  // This prevents empty chats filling the database.

  const startNewChat = () => {
    if (isLoading) return;

    setConversationId(null);
    conversationIdRef.current = null;

    setMessages(INITIAL_MESSAGES);

    setInput("");
  };

  // ========================================================
  // SEND USER MESSAGE
  // ========================================================

  const submit = async (text: string) => {
    const value = text.trim();

    if (!value || isLoading) return;

    const { data: sessionData } =
      await supabase.auth.getSession();

    const user = sessionData.session?.user;

    if (!user) {
      toast.error(
        "Du musst angemeldet sein.",
      );
      return;
    }

    // Start with the conversation currently open.
    let activeConversationId =
      conversationId;

    if (activeConversationId) {
      conversationIdRef.current =
        activeConversationId;
    }

    // ======================================================
    // CREATE CONVERSATION ON FIRST MESSAGE
    // ======================================================

    if (!activeConversationId) {
      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,

          // V1 title:
          // First message becomes the conversation title.
          title: value.slice(0, 60),
        })
        .select(
          "id, title, created_at, updated_at",
        )
        .single();

      if (
        conversationError ||
        !conversation
      ) {
        console.error(
          "AI conversation creation failed:",
          conversationError,
        );

        toast.error(
          "Chat konnte nicht gespeichert werden.",
        );

        return;
      }

      activeConversationId =
        conversation.id;

      setConversationId(
        conversation.id,
      );

      conversationIdRef.current =
        conversation.id;

      // Immediately show the new conversation
      // in the history list.
      setConversations((current) => [
        conversation as Conversation,
        ...current,
      ]);
    }

    // ======================================================
    // SAVE USER MESSAGE
    // ======================================================

    const { error: messageError } =
      await supabase
        .from("ai_messages")
        .insert({
          conversation_id:
            activeConversationId,

          user_id:
            user.id,

          role:
            "user",

          content:
            value,
        });

    if (messageError) {
      console.error(
        "AI user message save failed:",
        messageError,
      );

      toast.error(
        "Nachricht konnte nicht gespeichert werden.",
      );

      return;
    }

    // Update conversation timestamp.
    const now =
      new Date().toISOString();

    const { error: updateError } =
      await supabase
        .from("ai_conversations")
        .update({
          updated_at: now,
        })
        .eq(
          "id",
          activeConversationId,
        );

    if (updateError) {
      console.error(
        "Conversation timestamp update failed:",
        updateError,
      );
    }

    setConversations((current) => {
      const target = current.find(
        (conversation) =>
          conversation.id ===
          activeConversationId,
      );

      if (!target) return current;

      return [
        {
          ...target,
          updated_at: now,
        },
        ...current.filter(
          (conversation) =>
            conversation.id !==
            activeConversationId,
        ),
      ];
    });

    // Clear input immediately.
    setInput("");

    // Existing Gemini streaming remains unchanged.
    await sendMessage({
      text: value,
    });
  };

  // ========================================================
  // PAGE UI
  // ========================================================

  return (
    <AppShell
      title="KI-Coach"
      subtitle="Dein persönlicher Performance-Assistent"
      breadcrumbs={[
        {
          label: "Dashboard",
          to: "/",
        },
        {
          label: "KI-Coach",
        },
      ]}
    >
      <EditableShell storageKey="athleticiq.edit.coach.v1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* =================================================
              MAIN CHAT
              ================================================= */}

          <div className="lg:col-span-2 glass-strong rounded-3xl p-6 flex flex-col h-[640px]">
            {/* AI Coach header */}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-violet">
                  <Brain className="h-5 w-5 text-background" />
                </div>

                <div>
                  <div className="text-sm font-bold">
                    Athletic IQ Coach
                  </div>

                  <div className="text-[11px] text-neon-cyan flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-dot" />

                    {`STATUS: ${status} · loading=${isLoading} · conversationLoading=${conversationLoading}`}
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className="border-neon-violet/40 text-neon-violet"
              >
                Pro
              </Badge>
            </div>

            {/* ===============================================
                CHAT MESSAGES
                =============================================== */}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {conversationLoading ? (
                <div className="h-full grid place-items-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />

                    <span className="text-xs">
                      Unterhaltung wird geladen…
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={[
                          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",

                          message.role === "user"
                            ? "bg-gradient-to-br from-neon-cyan/25 to-neon-violet/20 border border-neon-cyan/30"
                            : "glass border-border/50",
                        ].join(" ")}
                      >
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                          <ReactMarkdown>
                            {messageText(message)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Waiting for Gemini to begin streaming */}

                  {status === "submitted" && (
                    <div className="flex justify-start">
                      <div className="glass border-border/50 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                        Coach analysiert…
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ===============================================
                SUGGESTED QUESTIONS
                =============================================== */}

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    disabled={
                      isLoading ||
                      conversationLoading
                    }
                    onClick={() =>
                      submit(suggestion)
                    }
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-white/[0.02] hover:border-neon-cyan/40 hover:text-neon-cyan transition disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>

            {/* ===============================================
                INPUT
                =============================================== */}

            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submit(input);
              }}
            >
              <Input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                placeholder="Frag deinen Coach…"
                disabled={
                  isLoading ||
                  conversationLoading
                }
                className="bg-white/[0.03] border-border/60 h-11"
              />

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  conversationLoading ||
                  !input.trim()
                }
                className="h-11 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>

          {/* =================================================
              CONVERSATION HISTORY
              ================================================= */}

          <div className="glass-strong rounded-3xl p-5 h-[640px] flex flex-col">
            {/* History header */}

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-neon-violet">
                  <History className="h-3.5 w-3.5" />

                  Unterhaltungen
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Deine bisherigen Athletic IQ Chats
                </div>
              </div>
            </div>

            {/* ===============================================
                NEW CHAT BUTTON
                =============================================== */}

            <Button
              type="button"
              onClick={
                startNewChat
              }
              disabled={
                isLoading
              }
              className="mt-4 w-full bg-gradient-to-r from-neon-cyan/20 to-neon-violet/20 border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60"
            >
              <Plus className="h-4 w-4 mr-2" />

              Neuer Chat
            </Button>

            {/* ===============================================
                CONVERSATION LIST
                =============================================== */}

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {historyLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                </div>
              ) : conversations.length ===
                0 ? (
                <div className="rounded-2xl border border-border/50 bg-white/[0.02] p-4 text-center">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mx-auto" />

                  <div className="text-sm font-semibold mt-2">
                    Noch keine Chats
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    Deine erste Unterhaltung wird hier automatisch gespeichert.
                  </div>
                </div>
              ) : (
                conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      conversationId;

                    return (
                      <button
                        type="button"
                        key={
                          conversation.id
                        }
                        disabled={
                          isLoading ||
                          conversationLoading
                        }
                        onClick={() =>
                          openConversation(
                            conversation,
                          )
                        }
                        className={[
                          "w-full text-left rounded-2xl border p-3 transition",

                          active
                            ? "border-neon-cyan/50 bg-neon-cyan/[0.08]"
                            : "border-border/50 bg-white/[0.02] hover:bg-white/[0.05] hover:border-neon-cyan/30",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare
                            className={[
                              "h-4 w-4 mt-0.5 shrink-0",

                              active
                                ? "text-neon-cyan"
                                : "text-muted-foreground",
                            ].join(
                              " ",
                            )}
                          />

                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {conversation.title ||
                                "Neue Unterhaltung"}
                            </div>

                            <div className="text-[10px] text-muted-foreground mt-1">
                              {new Date(
                                conversation.updated_at,
                              ).toLocaleDateString(
                                "de-DE",
                                {
                                  day: "2-digit",
                                  month:
                                    "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )
              )}
            </div>

            {/* ===============================================
                SMALL PERSISTENCE EXPLANATION
                =============================================== */}

            <div className="mt-3 rounded-2xl border border-neon-violet/20 bg-neon-violet/[0.04] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-neon-violet">
                <Sparkles className="h-3 w-3" />

                Athletic IQ Memory
              </div>

              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Unterhaltungen werden gespeichert,
                damit du sie später öffnen und
                fortsetzen kannst.
              </p>
            </div>
          </div>
        </div>
      </EditableShell>
    </AppShell>
  );
}

