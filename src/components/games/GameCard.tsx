import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Lock, Sparkles, ArrowRight, Brain, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameCardProps {
  game: Game;
  index: number;
  variant?: 'featured' | 'classic';
}

export function GameCard({ game, index, variant = 'classic' }: GameCardProps) {
  const { t } = useLanguage();
  const difficultyConfig = {
    Easy: { 
      color: 'bg-accent/15 text-accent border-accent/30',
      gradient: 'from-accent/20 to-accent/5'
    },
    Medium: { 
      color: 'bg-gold/15 text-gold border-gold/30',
      gradient: 'from-gold/20 to-gold/5'
    },
    Hard: { 
      color: 'bg-destructive/15 text-destructive border-destructive/30',
      gradient: 'from-destructive/20 to-destructive/5'
    },
  };

  const isAIPowered = ['constitutional-courtroom', 'case-law-detective', 'ai-debate', 'escape-room', 'rights-hotline', 'voter-impact-simulator', 'emergency-1975', 'courtroom-cross-examination'].includes(game.id);

  if (variant === 'featured') {
    return (
      <div
        className="group relative overflow-hidden rounded-3xl border border-border bg-card animate-fade-in hover:border-primary/30 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${difficultyConfig[game.difficulty].gradient} opacity-50`} />
        <div className="absolute top-0 right-0 w-56 h-56 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/15 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-accent/15 transition-colors duration-500" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            {/* Icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-150 group-hover:bg-primary/30 transition-colors duration-300" />
              <div className="relative text-6xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {game.icon}
              </div>
            </div>
            
            {/* AI Badge */}
            {isAIPowered && (
              <Badge className="bg-gradient-to-r from-primary to-saffron-light text-primary-foreground border-0 gap-1.5 px-3 py-1.5 shadow-soft">
                <Brain className="w-3.5 h-3.5" />
                {t('games.aiPowered')}
              </Badge>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300">
              {game.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {game.description}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="outline" className={`${difficultyConfig[game.difficulty].color} font-medium`}>
              {game.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
              {game.category}
            </Badge>
          </div>

          {/* Action */}
          {game.isAvailable ? (
            <Link to={`/games/${game.id}`} className="block">
              <Button 
                size="lg" 
                className="w-full gap-2 group/btn bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-saffron-dark shadow-soft hover:shadow-card transition-all duration-300"
              >
                <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                {t('games.startPlaying')}
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="lg" className="w-full gap-2" disabled>
              <Lock className="w-4 h-4" />
              {t('games.comingSoon')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Classic variant
  return (
    <div
      className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-elevated hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-5xl mb-5 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
          {game.icon}
        </div>

        {/* Content */}
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
          {game.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {game.description}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-5">
          <Badge variant="outline" className={`text-xs ${difficultyConfig[game.difficulty].color}`}>
            {game.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
            {game.category}
          </Badge>
        </div>

        {/* Action */}
        {game.isAvailable ? (
          <Link to={`/games/${game.id}`}>
            <Button variant="default" size="sm" className="w-full gap-2 group/btn">
              <Play className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
              {t('games.playNow')}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-2" disabled>
              <Lock className="w-3.5 h-3.5" />
              {t('games.comingSoon')}
          </Button>
        )}
      </div>
    </div>
  );
}
