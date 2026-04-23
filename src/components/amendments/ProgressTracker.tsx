import { Progress } from '@/components/ui/progress';
import { BookOpen } from 'lucide-react';

interface ProgressTrackerProps {
  exploredCount: number;
  totalCount: number;
}

export function ProgressTracker({ exploredCount, totalCount }: ProgressTrackerProps) {
  const percentage = totalCount > 0 ? (exploredCount / totalCount) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Your Progress</span>
        </div>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{exploredCount}</span> / {totalCount} amendments explored
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {exploredCount > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {percentage < 25 && "🌱 Just getting started! Keep exploring."}
          {percentage >= 25 && percentage < 50 && "📚 Great progress! You're learning fast."}
          {percentage >= 50 && percentage < 75 && "🔥 Halfway there! You're becoming an expert."}
          {percentage >= 75 && percentage < 100 && "🌟 Almost done! You're a constitution champion."}
          {percentage === 100 && "🏆 Amazing! You've explored all amendments!"}
        </p>
      )}
    </div>
  );
}
