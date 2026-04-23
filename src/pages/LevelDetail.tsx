import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Quiz } from '@/components/learn/Quiz';
import { VideoSection } from '@/components/learn/VideoSection';
import { LanguageSelector, supportedLanguages } from '@/components/learn/LanguageSelector';
import { LevelGoalCard } from '@/components/learn/LevelGoalCard';
import { RealLifeEventsSection } from '@/components/learn/RealLifeEventsSection';
import { levels } from '@/data/levels';
import { getQuizForLevel } from '@/data/quizzes';
import { useProgress } from '@/hooks/useProgress';
import { useAIQuestions } from '@/hooks/useAIQuestions';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { getLevelGoal } from '@/data/levelGoals';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Trophy, Star, CheckCircle, Sparkles, Loader2, Play, Languages, Target, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';

export default function LevelDetail() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { isLevelUnlocked, isLevelCompleted, completeLevel, saveQuizScore, addXP, progress } = useProgress();
  const { generateLevelQuestions, isLoading: isLoadingAI, isTranslating } = useAIQuestions();
  const { getCurrentDifficulty, getDifficultyLabel } = useAdaptiveDifficulty();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVideos, setShowVideos] = useState(true);
  const [videosCompleted, setVideosCompleted] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<QuizQuestion[]>([]);
  const [useAI, setUseAI] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('quiz-language') || 'en';
  });

  const level = levels.find(l => l.id === Number(levelId));
  const fallbackQuestions = getQuizForLevel(Number(levelId));
  const levelGoal = getLevelGoal(Number(levelId));
  const currentScore = progress.quizScores[Number(levelId)];
  const difficultyInfo = getDifficultyLabel();

  // Save language preference
  useEffect(() => {
    localStorage.setItem('quiz-language', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    // Reset when level changes
    setShowQuiz(false);
    setShowVideos(true);
    setVideosCompleted(false);
    setAiQuestions([]);
  }, [levelId]);

  if (!level) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Level not found</h1>
          <Link to="/learn">
            <Button variant="outline">Back to Learning Path</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isUnlocked = isLevelUnlocked(level.id);
  const isCompleted = isLevelCompleted(level.id);

  if (!isUnlocked) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Level Locked</h1>
          <p className="text-muted-foreground mb-6">Score at least 50% on Level {level.id - 1} to unlock this level</p>
          <Link to="/learn">
            <Button variant="outline">Back to Learning Path</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleStartQuiz = async () => {
    if (useAI) {
      setIsGenerating(true);
      const difficulty = getCurrentDifficulty();
      const questions = await generateLevelQuestions(level.id, 25, selectedLanguage);
      if (questions.length > 0) {
        const formattedQuestions: QuizQuestion[] = questions.map((q, index) => ({
          id: `ai-${level.id}-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          articleReference: q.articleReference,
          ...(q as any).isScenario && { isScenario: true },
        }));
        setAiQuestions(formattedQuestions);
      }
      setIsGenerating(false);
    }
    setShowQuiz(true);
    setShowVideos(false);
  };

  const getLanguageName = (code: string) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang?.native || 'English';
  };

  const handleQuizComplete = (score: number) => {
    saveQuizScore(level.id, score);
    
    // Award bonus XP for 80%+ score
    if (score >= 80 && levelGoal) {
      addXP(levelGoal.bonusXP);
    }
    
    if (score >= 50) {
      completeLevel(level.id, level.xpReward);
    }
  };

  const handleSkipVideos = () => {
    setShowVideos(false);
  };

  const questionsToUse = useAI && aiQuestions.length > 0 ? aiQuestions : fallbackQuestions;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/learn" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Path
        </Link>

        {/* Level Goal Card */}
        <div className="mb-6">
          <LevelGoalCard levelId={level.id} currentScore={currentScore} />
        </div>

        {/* Level header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-card">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-4xl shrink-0">
              {level.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Level {level.id}</span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-sm text-accent">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
                {/* Adaptive difficulty badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full bg-muted ${difficultyInfo.color}`}>
                  {difficultyInfo.label}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
              <p className="text-muted-foreground mb-4">{level.description}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-gold">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">+{level.xpReward} XP</span>
                </div>
                {levelGoal && (
                  <div className="flex items-center gap-1 text-accent">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm">+{levelGoal.bonusXP} bonus for 80%+</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{level.topics.length} Topics</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Play className="w-5 h-5" />
                  <span>Videos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        {!showQuiz && (
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showVideos ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent'
            }`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
              Watch Videos
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !showVideos && !showQuiz ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</span>
              Take Quiz
            </div>
          </div>
        )}

        {showQuiz ? (
          <>
            {questionsToUse.length > 0 ? (
              <Quiz
                questions={questionsToUse}
                levelId={level.id}
                onComplete={handleQuizComplete}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions available. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowQuiz(false)}>
                  Go Back
                </Button>
              </div>
            )}
          </>
        ) : showVideos ? (
          <div className="space-y-8">
            <VideoSection 
              topics={level.topics}
              onAllWatched={() => setVideosCompleted(true)} 
            />
            
            {/* Real Life Events Section */}
            <RealLifeEventsSection levelId={level.id} />
            
            {/* Continue to quiz section */}
            <div className="bg-muted/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Ready to test your knowledge?</h3>
                <p className="text-sm text-muted-foreground">
                  {videosCompleted 
                    ? "Great job! You've watched all the videos. Take the quiz now!" 
                    : "Watch the videos first, or skip ahead if you're confident."}
                </p>
              </div>
              <div className="flex gap-3">
                {!videosCompleted && (
                  <Button variant="outline" onClick={handleSkipVideos}>
                    Skip Videos
                  </Button>
                )}
                <Button 
                  variant={videosCompleted ? "hero" : "default"}
                  onClick={() => setShowVideos(false)}
                >
                  Continue to Quiz
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Topics section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {level.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Life Events Section */}
            <div className="mb-8">
              <RealLifeEventsSection levelId={level.id} />
            </div>

            {/* Start Quiz CTA */}
            <div className="bg-muted/50 rounded-2xl p-8 text-center">
              <Trophy className="w-12 h-12 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready to Test Your Knowledge?</h3>
              <p className="text-muted-foreground mb-2">
                Score at least 50% to complete this level and earn {level.xpReward} XP
              </p>
              {levelGoal && (
                <p className="text-sm text-accent mb-4">
                  🌟 Score 80%+ for an extra {levelGoal.bonusXP} bonus XP!
                </p>
              )}

              {/* Difficulty indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm mb-4">
                <Target className="w-4 h-4" />
                <span>Difficulty: <span className={difficultyInfo.color}>{difficultyInfo.label}</span></span>
                <span className="text-xs text-muted-foreground">({difficultyInfo.description})</span>
              </div>

              {/* Language & AI Options */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                {/* Language Selector */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Learn in:</span>
                  <LanguageSelector 
                    value={selectedLanguage} 
                    onChange={setSelectedLanguage}
                    disabled={isGenerating}
                  />
                </div>

                {/* AI Toggle */}
                <button
                  onClick={() => setUseAI(!useAI)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    useAI 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Generated Questions</span>
                </button>
              </div>

              {selectedLanguage !== 'en' && useAI && (
                <p className="text-sm text-muted-foreground mb-4">
                  Questions will be generated in English and translated to {getLanguageName(selectedLanguage)}
                </p>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowVideos(true)}>
                  ← Back to Videos
                </Button>
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handleStartQuiz}
                  disabled={isGenerating || isTranslating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isTranslating ? 'Translating...' : 'Generating 25 Questions...'}
                    </>
                  ) : (
                    <>Start Quiz (25 Questions)</>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
