import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getRealLifeEventsForLevel, RealLifeEvent } from '@/data/levelGoals';
import { Globe, Calendar, BookOpen, ChevronRight, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealLifeEventsSectionProps {
  levelId: number;
}

export function RealLifeEventsSection({ levelId }: RealLifeEventsSectionProps) {
  const events = getRealLifeEventsForLevel(levelId);
  const [selectedEvent, setSelectedEvent] = useState<RealLifeEvent | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (events.length === 0) {
    return null;
  }

  const fetchAIExplanation = async (event: RealLifeEvent) => {
    setIsLoading(true);
    setAiExplanation('');
    
    try {
      const { data, error } = await supabase.functions.invoke('explain-topic', {
        body: {
          topic: `${event.title}: ${event.description}`,
          relatedArticles: event.relatedArticles,
          type: 'real-life-event',
        },
      });

      if (error) throw error;
      setAiExplanation(data.explanation || 'Unable to generate explanation.');
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
      setAiExplanation('Could not load explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (event: RealLifeEvent) => {
    setSelectedEvent(event);
    fetchAIExplanation(event);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          In Real Life
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          See how these concepts apply to real events in Indian history:
        </p>
        
        <div className="grid gap-3">
          {events.map(event => (
            <Dialog key={event.id}>
              <DialogTrigger asChild>
                <button
                  onClick={() => handleEventClick(event)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {event.year && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.year}
                        </span>
                      )}
                      <span className="text-xs text-primary flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {event.relatedArticles.join(', ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              </DialogTrigger>
              
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="text-2xl">{event.icon}</span>
                    {event.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {event.year && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                        <Calendar className="w-3 h-3" />
                        {event.year}
                      </span>
                    )}
                    {event.relatedArticles.map(article => (
                      <span key={article} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        <BookOpen className="w-3 h-3" />
                        {article}
                      </span>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Constitutional Connection</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Generating explanation...</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed">
                        {aiExplanation || 'Click to learn how this event connects to the Constitution.'}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
