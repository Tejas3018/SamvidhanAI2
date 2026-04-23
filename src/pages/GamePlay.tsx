import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { MatchArticleGame } from '@/components/games/MatchArticleGame';
import { QuizBattleGame } from '@/components/games/QuizBattleGame';
import { GuessArticleGame } from '@/components/games/GuessArticleGame';
import { ScenarioChallengeGame } from '@/components/games/ScenarioChallengeGame';
import { TimelineMasterGame } from '@/components/games/TimelineMasterGame';
import { WordScrambleGame } from '@/components/games/WordScrambleGame';
import { ConstitutionalCourtroomGame } from '@/components/games/ConstitutionalCourtroomGame';
import { CaseLawDetectiveGame } from '@/components/games/CaseLawDetectiveGame';
import { AIDebateGame } from '@/components/games/AIDebateGame';
import { EscapeRoomGame } from '@/components/games/EscapeRoomGame';
import { RightsHotlineGame } from '@/components/games/RightsHotlineGame';
import { Emergency1975Game } from '@/components/games/Emergency1975Game';
import { VoterImpactSimulatorGame } from '@/components/games/VoterImpactSimulatorGame';
import { CourtroomCrossExaminationGame } from '@/components/games/CourtroomCrossExaminationGame';
import { games } from '@/data/games';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';

export default function GamePlay() {
  const { gameId } = useParams();
  
  const game = games.find(g => g.id === gameId);

  const isAIPowered = ['constitutional-courtroom', 'case-law-detective', 'ai-debate', 'escape-room', 'rights-hotline', 'voter-impact-simulator', 'emergency-1975', 'courtroom-cross-examination'].includes(gameId || '');

  if (!game) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🎮</div>
            <h1 className="text-2xl font-bold mb-4">Game not found</h1>
            <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist.</p>
            <Link to="/games">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const renderGame = () => {
    switch (gameId) {
      case 'courtroom-cross-examination':
        return <CourtroomCrossExaminationGame />;
      case 'voter-impact-simulator':
        return <VoterImpactSimulatorGame />;
      case 'emergency-1975':
        return <Emergency1975Game />;
      case 'escape-room':
        return <EscapeRoomGame />;
      case 'rights-hotline':
        return <RightsHotlineGame />;
      case 'constitutional-courtroom':
        return <ConstitutionalCourtroomGame />;
      case 'case-law-detective':
        return <CaseLawDetectiveGame />;
      case 'ai-debate':
        return <AIDebateGame />;
      case 'match-article':
        return <MatchArticleGame />;
      case 'quiz-battle':
        return <QuizBattleGame />;
      case 'guess-article':
        return <GuessArticleGame />;
      case 'scenario-challenge':
        return <ScenarioChallengeGame />;
      case 'timeline-master':
        return <TimelineMasterGame />;
      case 'word-scramble':
        return <WordScrambleGame />;
      default:
        return (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚧</div>
            <p className="text-xl text-muted-foreground mb-6">
              This game is coming soon!
            </p>
            <Link to="/games">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Games
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/games" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Games</span>
        </Link>

        {/* Game header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-125" />
            <div className="relative text-6xl md:text-7xl transform hover:scale-105 hover:rotate-3 transition-transform duration-300">
              {game.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">{game.title}</h1>
              {isAIPowered && (
                <Badge className="bg-gradient-to-r from-primary to-saffron-light text-primary-foreground border-0 gap-1.5 px-3 py-1">
                  <Brain className="w-3.5 h-3.5" />
                  AI Powered
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">{game.description}</p>
          </div>
        </div>

        {/* Game content */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
          {renderGame()}
        </div>
      </div>
    </Layout>
  );
}
