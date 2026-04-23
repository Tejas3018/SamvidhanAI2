import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Level } from '@/types';
import { Lock, CheckCircle2, Play, Star, Bot, X, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  index: number;
}

interface TopicExplanation {
  topic: string;
  explanation: string | null;
  isLoading: boolean;
}

export function LevelCard({ level, isUnlocked, isCompleted, progress, index }: LevelCardProps) {
  const [topicExplanations, setTopicExplanations] = useState<Record<string, TopicExplanation>>({});
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const handleExplainTopic = async (topic: string) => {
    if (expandedTopic === topic) {
      setExpandedTopic(null);
      return;
    }

    if (topicExplanations[topic]?.explanation) {
      setExpandedTopic(topic);
      return;
    }

    setExpandedTopic(topic);
    setTopicExplanations(prev => ({
      ...prev,
      [topic]: { topic, explanation: null, isLoading: true }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('explain-topic', {
        body: { topic, levelTitle: level.title }
      });

      if (error) throw error;

      setTopicExplanations(prev => ({
        ...prev,
        [topic]: { topic, explanation: data.explanation, isLoading: false }
      }));
    } catch (error) {
      console.error('Error explaining topic:', error);
      toast.error('Failed to get explanation. Please try again.');
      setTopicExplanations(prev => ({
        ...prev,
        [topic]: { topic, explanation: null, isLoading: false }
      }));
      setExpandedTopic(null);
    }
  };

  return (
    <div
      className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ${
        isCompleted
          ? 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-2 border-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10'
          : isUnlocked
          ? 'bg-card border-2 border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
          : 'bg-muted/30 border-2 border-border/30'
      }`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animation: 'reveal 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isUnlocked && !isCompleted && (
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        )}
        {isCompleted && (
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        )}
      </div>

      {/* Status Bar with Gradient */}
      <div className={`h-1.5 ${
        isCompleted 
          ? 'bg-gradient-to-r from-accent via-accent/80 to-accent' 
          : isUnlocked 
          ? 'gradient-hero' 
          : 'bg-muted/50'
      }`} />

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 ${
              isCompleted
                ? 'bg-accent/20 ring-2 ring-accent/30'
                : isUnlocked
                ? 'bg-primary/10 ring-2 ring-primary/20 group-hover:ring-primary/40'
                : 'bg-muted ring-2 ring-border/50'
            }`}>
              {level.icon}
              {isUnlocked && !isCompleted && (
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-pulse" />
              )}
            </div>
            
            <div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-1 ${
                isCompleted 
                  ? 'bg-accent/20 text-accent' 
                  : isUnlocked 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span>Level {level.id}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <h3 className="font-bold text-lg leading-tight">{level.title}</h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
            isCompleted
              ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30'
              : isUnlocked
              ? 'gradient-hero text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110'
              : 'bg-muted/80 text-muted-foreground'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isUnlocked ? (
              <Play className="w-5 h-5 ml-0.5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{level.description}</p>

        {/* Topics with AI Explain */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Topics</span>
            {isUnlocked && (
              <span className="text-xs text-primary/70 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Click for AI explanation
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {level.topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => isUnlocked && handleExplainTopic(topic)}
                disabled={!isUnlocked}
                className={`group/topic inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-muted/80 hover:bg-primary/15 hover:text-primary cursor-pointer hover:scale-105'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                } ${expandedTopic === topic ? 'bg-primary/15 text-primary ring-2 ring-primary/30 scale-105' : ''}`}
              >
                <span>{topic}</span>
                {isUnlocked && (
                  <Bot className={`w-3.5 h-3.5 transition-all duration-200 ${
                    expandedTopic === topic ? 'opacity-100 text-primary' : 'opacity-0 group-hover/topic:opacity-100'
                  }`} />
                )}
              </button>
            ))}
          </div>

          {/* AI Explanation Panel */}
          {expandedTopic && isUnlocked && (
            <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{expandedTopic}</span>
                </div>
                <button
                  onClick={() => setExpandedTopic(null)}
                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              
              {topicExplanations[expandedTopic]?.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/20 animate-ping" />
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              ) : topicExplanations[expandedTopic]?.explanation ? (
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {topicExplanations[expandedTopic].explanation}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Progress Bar - Enhanced */}
        {isUnlocked && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className={`font-bold ${isCompleted ? 'text-accent' : 'text-primary'}`}>{progress}%</span>
            </div>
            <div className="h-2.5 bg-muted/80 rounded-full overflow-hidden">
              <div
                className={`h-full progress-fill rounded-full transition-all duration-700 ${
                  isCompleted ? 'bg-accent' : 'gradient-hero'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-sm font-bold text-gold">+{level.xpReward} XP</span>
          </div>

          {isUnlocked && (
            <Link to={`/learn/${level.id}`}>
              <Button 
                size="sm" 
                variant={isCompleted ? "outline" : "default"}
                className={`h-9 px-5 font-semibold gap-1.5 transition-all duration-300 ${
                  !isCompleted ? 'group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20' : ''
                }`}
              >
                {isCompleted ? 'Review' : 'Start Learning'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Locked Overlay - Enhanced */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-3 border border-border">
              <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Level Locked
            </p>
            <p className="text-xs text-muted-foreground/70">
              Complete Level {level.id - 1} to unlock
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
