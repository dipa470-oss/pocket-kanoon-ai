import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConversationSummary = {
  id: string;
  title: string;
  updated_at: string;
};

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

type StartConversationOptions = {
  title?: string;
  module?: string;
  /** When true, always insert a new row (e.g. "New chat" button). */
  forceNew?: boolean;
};

export function useChat(userId: string | undefined) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const conversationIdRef = useRef<string | null>(null);

  const syncConversationId = useCallback((id: string | null) => {
    conversationIdRef.current = id;
    setConversationId(id);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setConversations(data ?? []);
  }, [userId]);

  /**
   * Creates a conversations row and returns its id.
   * Must run before any messages insert.
   */
  const startConversation = useCallback(
    async (opts: StartConversationOptions = {}): Promise<string> => {
      if (!userId) {
        throw new Error("You must be signed in to start a chat.");
      }

      if (!opts.forceNew && conversationIdRef.current) {
        return conversationIdRef.current;
      }

      const title = (opts.title?.trim() || "New chat").slice(0, 60);
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title,
          module: opts.module ?? "personal_lawyer",
        })
        .select("id,title,updated_at")
        .single();

      if (error || !data?.id) {
        throw new Error(error?.message ?? "Could not start conversation");
      }

      conversationIdRef.current = data.id;
      setConversationId(data.id);
      setConversations((prev) => {
        const without = prev.filter((c) => c.id !== data.id);
        return [data, ...without];
      });

      return data.id;
    },
    [userId],
  );

  const selectConversation = useCallback((id: string) => {
    conversationIdRef.current = id;
    setConversationId(id);
  }, []);

  const resetConversation = useCallback(() => {
    conversationIdRef.current = null;
    setConversationId(null);
  }, []);

  const insertMessage = useCallback(
    async (
      convId: string,
      message: Pick<ChatMessage, "role" | "content">,
    ): Promise<void> => {
      if (!userId) {
        throw new Error("You must be signed in to send messages.");
      }
      if (!convId) {
        throw new Error("conversation_id is required");
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: convId,
        user_id: userId,
        role: message.role,
        content: message.content,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    [userId],
  );

  return {
    conversationId,
    conversations,
    setConversations,
    loadConversations,
    startConversation,
    selectConversation,
    resetConversation,
    insertMessage,
    syncConversationId,
  };
}
