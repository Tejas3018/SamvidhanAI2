import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, Loader2, Sparkles, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistorySidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  userId: string | null;
}

export function ChatHistorySidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewChat,
  userId 
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSessions();
    } else {
      setSessions([]);
      setIsLoading(false);
    }
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    setDeleteConfirmId(null);
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        onNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupedSessions = sessions.reduce((groups, session) => {
    const label = formatDate(session.updated_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  if (!userId) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-3">
          <Button 
            onClick={onNewChat} 
            className="w-full gap-2 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20" 
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Sign in to save chats
          </p>
          <p className="text-xs text-muted-foreground/70">
            Your conversation history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <Button 
          onClick={onNewChat} 
          className="w-full gap-2 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-3 pb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Loading chats...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70">Start a new chat to begin</p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([dateLabel, dateSessions]) => (
              <div key={dateLabel} className="mb-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-2 mb-2">
                  {dateLabel}
                </p>
                <div className="space-y-1">
                  {dateSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSessionSelect(session.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group",
                        currentSessionId === session.id
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/80 text-foreground border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                        currentSessionId === session.id
                          ? "bg-primary/20"
                          : "bg-muted group-hover:bg-muted-foreground/10"
                      )}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm truncate font-medium">{session.title}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-lg transition-all">
                            {deletingId === session.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(session.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && handleDeleteSession(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
