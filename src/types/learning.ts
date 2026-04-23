// Enhanced learning types

export interface RevisionSchedule {
  id: string;
  levelId: number;
  levelTitle: string;
  levelIcon: string;
  scheduledDate: string; // ISO date string
  type: 'next_day' | '3_days' | '7_days';
  completed: boolean;
  completedAt?: string;
  xpEarned?: number;
}

export interface WeakTopic {
  topic: string;
  articleReference?: string;
  levelId: number;
  incorrectCount: number;
  totalAttempts: number;
  lastIncorrect: string; // ISO date string
  mastered: boolean;
}

export interface VideoProgress {
  videoId: string;
  levelId: number;
  watched: boolean;
  understood: boolean; // answered micro-check correctly
  watchedAt?: string;
  microCheckAnswer?: number;
}

export interface SkillMastery {
  skill: 'articles' | 'amendments' | 'cases' | 'reasoning' | 'scenarios';
  level: number; // 0-100
  questionsAttempted: number;
  correctAnswers: number;
  lastUpdated: string;
}

export interface LevelGoal {
  levelId: number;
  goal: string;
  reward: string;
  badgeId?: string;
  bonusXP: number;
}

export interface QuizMistake {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  selectedOption: string;
  correctOption: string;
  explanation: string;
  articleReference?: string;
  levelId: number;
  timestamp: string;
}

export interface AdaptiveDifficultySettings {
  level: 'easy' | 'normal' | 'hard';
  recentScores: number[];
  adjustedAt: string;
}

export interface RealLifeEvent {
  id: string;
  title: string;
  description: string;
  year?: number;
  relatedArticles: string[];
  levelId: number;
  icon: string;
}

export interface AICoachMessage {
  type: 'encouragement' | 'suggestion' | 'warning' | 'celebration';
  message: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface MicroCheckQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  articleReference?: string;
}
