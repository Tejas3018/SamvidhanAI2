import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  user_id: string;
}

export function useChatSession() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
      if (!session?.user) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const createSession = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!userId) return null;

    try {
      // Create title from first message (truncate if too long)
      const title = firstMessage.length > 50 
        ? firstMessage.substring(0, 47) + '...' 
        : firstMessage;

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to create session:', err);
      return null;
    }
  }, [userId]);

  const addMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    sessionId?: string
  ): Promise<string | null> => {
    const targetSessionId = sessionId || currentSessionId;
    if (!targetSessionId) return null;

    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      role,
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    if (!userId) return tempId;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: targetSessionId,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the temp ID with real ID
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data.id } 
            : msg
        )
      );

      // Update session updated_at
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', targetSessionId);

      return data.id;
    } catch (err) {
      console.error('Failed to save message:', err);
      return tempId;
    }
  }, [currentSessionId, userId]);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    loadSessionMessages(sessionId);
  }, [loadSessionMessages]);

  return {
    currentSessionId,
    messages,
    userId,
    isLoadingMessages,
    createSession,
    addMessage,
    startNewChat,
    selectSession,
    setMessages,
  };
}
