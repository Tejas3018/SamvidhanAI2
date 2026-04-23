import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Send, Bot, User, Loader2, Sparkles, AlertCircle, BookOpen, Scale, FileText, Users, 
  Mic, MicOff, Volume2, VolumeX, Globe, ChevronDown, StopCircle, PanelLeftClose, PanelLeft, MessageSquarePlus,
  ArrowUp, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { useChatSession } from '@/hooks/useChatSession';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  { text: "What are the Fundamental Rights?", icon: Scale, color: "from-orange-500 to-amber-500" },
  { text: "Explain Article 21 in simple terms", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { text: "What are the Fundamental Duties?", icon: Users, color: "from-green-500 to-emerald-500" },
  { text: "How is the President elected?", icon: BookOpen, color: "from-purple-500 to-pink-500" },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', nativeName: 'Hindi' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', nativeName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', nativeName: 'Telugu' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', nativeName: 'Bengali' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', nativeName: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', nativeName: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', nativeName: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳', nativeName: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', nativeName: 'Punjabi' },
];

const TTS_VOICES = [
  { id: 'alloy', name: 'Alloy', desc: 'Neutral' },
  { id: 'echo', name: 'Echo', desc: 'Male' },
  { id: 'fable', name: 'Fable', desc: 'Expressive' },
  { id: 'onyx', name: 'Onyx', desc: 'Deep' },
  { id: 'nova', name: 'Nova', desc: 'Female' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Warm' },
];

export function ChatInterface() {
  const {
    currentSessionId,
    messages,
    userId,
    isLoadingMessages,
    createSession,
    addMessage,
    startNewChat,
    selectSession,
  } = useChatSession();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState(TTS_VOICES[0]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder({
    onTranscription: (text) => setInput(text),
    onError: (err) => setError(err),
    language: selectedLanguage.code,
  });

  const { isSpeaking, speak, stop } = useTextToSpeech({
    voice: selectedVoice.id,
    onError: (err) => setError(err),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    let sessionId = currentSessionId;

    if (!sessionId && userId) {
      sessionId = await createSession(text);
    }

    await addMessage('user', text, sessionId || undefined);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('constitution-chat', {
        body: { question: text, language: selectedLanguage.code },
      });

      if (fnError) {
        // Check for specific error types
        const errorMsg = fnError.message || '';
        if (errorMsg.includes('Failed to send') || errorMsg.includes('FetchError')) {
          throw new Error('Could not connect to the AI service. Please check your connection and try again.');
        }
        throw new Error(errorMsg || 'Failed to get response');
      }
      if (data?.error) throw new Error(data.error);
      
      const assistantContent = data?.answer || 'This information is not available in the Constitution context.';
      await addMessage('assistant', assistantContent, sessionId || undefined);

      if (autoSpeak) speak(assistantContent);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Sidebar */}
        <aside 
          className={cn(
            "h-full border-r border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
            sidebarOpen ? "w-72" : "w-0 md:w-16"
          )}
        >
          {/* Collapsed state - mini sidebar */}
          {!sidebarOpen && (
            <div className="hidden md:flex h-full w-16 flex-col items-center py-4 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <PanelLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={startNewChat}
                  >
                    <MessageSquarePlus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New Chat</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Expanded sidebar */}
          <div className={cn(
            "h-full flex flex-col transition-opacity duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">Chat History</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>
            <ChatHistorySidebar
              currentSessionId={currentSessionId}
              onSessionSelect={selectSession}
              onNewChat={startNewChat}
              userId={userId}
            />
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-20 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 md:hidden shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">Chat History</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>
            <ChatHistorySidebar
              currentSessionId={currentSessionId}
              onSessionSelect={(id) => {
                selectSession(id);
                setSidebarOpen(false);
              }}
              onNewChat={() => {
                startNewChat();
                setSidebarOpen(false);
              }}
              userId={userId}
            />
          </div>
        </div>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-40" />
                <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Samvidhan AI</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="truncate">Your Constitutional Guide</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-3 rounded-xl hover:bg-muted/80">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-base">{selectedLanguage.flag}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-y-auto rounded-xl">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className={cn("gap-3 rounded-lg", selectedLanguage.code === lang.code && "bg-primary/10 text-primary")}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-3 rounded-xl hover:bg-muted/80">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {TTS_VOICES.map((voice) => (
                    <DropdownMenuItem
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      className={cn("rounded-lg", selectedVoice.id === voice.id && "bg-primary/10 text-primary")}
                    >
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-muted-foreground ml-2">({voice.desc})</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={autoSpeak ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all",
                      autoSpeak ? "bg-primary shadow-lg" : "hover:bg-muted/80"
                    )}
                    onClick={() => setAutoSpeak(!autoSpeak)}
                  >
                    {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{autoSpeak ? 'Auto-speak on' : 'Auto-speak off'}</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Messages area */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
                      </div>
                      <span className="text-sm text-muted-foreground">Loading messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                    {/* Hero Section */}
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-3xl" />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl">
                        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                      How can I help you today?
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-10 max-w-md">
                      Ask me anything about the Indian Constitution in <span className="font-medium text-primary">{selectedLanguage.nativeName}</span>
                    </p>

                    {/* Suggested Questions Grid */}
                    <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q.text)}
                          className="group relative flex items-start gap-3 p-4 rounded-2xl text-left bg-card hover:bg-card/80 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-inner",
                            q.color
                          )}>
                            <q.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                            {q.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-4",
                          message.role === 'user' && "flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                          message.role === 'user' 
                            ? "bg-gradient-to-br from-primary to-primary/80 text-white" 
                            : "bg-gradient-to-br from-muted to-muted/80 border border-border/50"
                        )}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 md:w-5 md:h-5" />
                          ) : (
                            <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          )}
                        </div>
                        
                        <div className={cn(
                          "group max-w-[85%] space-y-2",
                          message.role === 'user' && "items-end"
                        )}>
                          <div className={cn(
                            "px-4 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed",
                            message.role === 'user'
                              ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md shadow-lg"
                              : "bg-card border border-border/50 rounded-bl-md shadow-sm"
                          )}>
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-li:my-0.5">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          
                          <div className={cn(
                            "flex items-center gap-2 px-1",
                            message.role === 'user' && "justify-end"
                          )}>
                            <span className="text-[11px] text-muted-foreground/70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.role === 'assistant' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 rounded-lg transition-all"
                                onClick={() => handleSpeakMessage(message.content)}
                              >
                                {isSpeaking ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-muted to-muted/80 border border-border/50 flex items-center justify-center shadow-sm">
                          <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <div className="bg-card border border-border/50 px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>
          </div>

          {/* Input area */}
          <div className="border-t border-border/50 bg-gradient-to-t from-background via-background to-transparent p-4 md:p-6 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-card border border-border/50 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-300">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-11 w-11 rounded-xl flex-shrink-0 transition-all",
                        isRecording 
                          ? "bg-destructive text-white shadow-lg shadow-destructive/30" 
                          : "hover:bg-muted"
                      )}
                      onClick={toggleRecording}
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isRecording ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop recording' : 'Voice input'}
                  </TooltipContent>
                </Tooltip>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Ask anything about the Constitution...`}
                  className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm md:text-base py-3 px-2 max-h-[200px] min-h-[48px] placeholder:text-muted-foreground/70"
                  disabled={isLoading || isRecording}
                  rows={1}
                />

                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-xl flex-shrink-0 transition-all",
                    input.trim() 
                      ? "bg-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <p className="text-sm text-destructive font-medium">
                    Recording... Click mic to stop
                  </p>
                </div>
              )}

              <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
                Samvidhan AI provides information about the Indian Constitution. Always verify important legal matters.
              </p>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
