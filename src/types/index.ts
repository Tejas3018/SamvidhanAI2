export interface YouTubeVideo {
  id: string;
  title: string;
  duration: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  icon: string;
  topics: string[];
  videos: YouTubeVideo[];
  xpReward: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedAt?: Date;
}

export interface UserProgress {
  currentLevel: number;
  totalXP: number;
  completedLevels: number[];
  earnedBadges: string[];
  quizScores: { [levelId: number]: number };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  articleReference?: string;
}

export interface Amendment {
  id: number;
  number: string;
  title: string;
  date: string;
  year: number;
  summary: string;
  impact: string;
  category: 'Fundamental Rights' | 'Governance' | 'Elections' | 'Reservations' | 'Judiciary' | 'Other';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  articleReference?: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  isAvailable: boolean;
}
