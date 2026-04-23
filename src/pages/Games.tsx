import { Layout } from '@/components/layout/Layout';
import { GameCard } from '@/components/games/GameCard';
import { games } from '@/data/games';
import { Gamepad2, Sparkles, Trophy, Brain, Zap, Star, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Games() {
  const { t } = useLanguage();
  const categories = [...new Set(games.map(g => g.category))];
  const aiGameIds = ['constitutional-courtroom', 'case-law-detective', 'ai-debate', 'escape-room', 'rights-hotline', 'voter-impact-simulator', 'emergency-1975', 'courtroom-cross-examination'];
  const aiPoweredGames = games.filter(g => aiGameIds.includes(g.id));
  const classicGames = games.filter(g => !aiGameIds.includes(g.id));

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">{t('games.badge')}</span>
                <div className="w-1 h-1 rounded-full bg-primary/50" />
                <span className="text-sm text-muted-foreground">{games.length} {t('nav.games')}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in tracking-tight leading-[1.1]" style={{ animationDelay: '0.1s' }}>
                <span className="gradient-text">{t('games.title').split(' ').slice(0, 1).join(' ')}</span>
                <br />
                <span className="text-foreground">{t('games.title').split(' ').slice(1).join(' ')}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
                {t('games.subtitle')}
              </p>

              {/* Stats Pills */}
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">{aiPoweredGames.length} {t('games.aiGames')}</div>
                    <div className="text-xs text-muted-foreground">{t('games.poweredByGPT')}</div>
                  </div>
                </div>
                <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-soft hover:shadow-card hover:border-accent/20 transition-all duration-300">
                  <div className="p-2 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">{classicGames.length} {t('games.classic')}</div>
                    <div className="text-xs text-muted-foreground">{t('games.quizPuzzles')}</div>
                  </div>
                </div>
                <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-soft hover:shadow-card hover:border-gold/20 transition-all duration-300">
                  <div className="p-2 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                    <Trophy className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">{t('games.earnXP')}</div>
                    <div className="text-xs text-muted-foreground">{t('games.trackProgress')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Games Section */}
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-bold">{t('games.aiPoweredGames')}</h2>
                  <Badge className="bg-gradient-to-r from-primary to-saffron-light text-primary-foreground border-0 px-3 py-1 animate-pulse">
                    <Star className="w-3 h-3 mr-1" />
                    {t('games.featured')}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {t('games.aiPoweredSubtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-20">
            {aiPoweredGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} variant="featured" />
            ))}
          </div>

          {/* Classic Games Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-muted border border-border">
                <Gamepad2 className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">{t('games.classicGames')}</h2>
                <p className="text-muted-foreground mt-1">
                  {t('games.classicSubtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {classicGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} variant="classic" />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="relative bg-gradient-to-b from-background via-muted/30 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="relative bg-card border border-border rounded-3xl p-8 md:p-14 overflow-hidden shadow-elevated">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold">{t('games.whyGamified')}</h3>
                      <p className="text-muted-foreground">{t('games.whyGamifiedSubtitle')}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <div className="text-5xl font-bold gradient-text mb-3">40%</div>
                      <div className="font-semibold text-foreground mb-1">{t('games.betterRetention')}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('games.betterRetentionDesc')}
                      </p>
                    </div>
                    <div className="group p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 hover:border-accent/30 transition-all duration-300">
                      <div className="text-5xl font-bold text-accent mb-3">2x</div>
                      <div className="font-semibold text-foreground mb-1">{t('games.fasterLearning')}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('games.fasterLearningDesc')}
                      </p>
                    </div>
                    <div className="group p-6 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/10 hover:border-gold/30 transition-all duration-300">
                      <div className="text-5xl font-bold text-gold mb-3">100%</div>
                      <div className="font-semibold text-foreground mb-1">{t('games.moreEngaging')}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('games.moreEngagingDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
