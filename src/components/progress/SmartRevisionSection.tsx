import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRevisionSchedule } from '@/hooks/useRevisionSchedule';
import { RotateCcw, Calendar, CheckCircle2, AlertCircle, Clock, Play } from 'lucide-react';

interface SmartRevisionSectionProps {
  onStartRevision?: (levelId: number, revisionId: string) => void;
}

export function SmartRevisionSection({ onStartRevision }: SmartRevisionSectionProps) {
  const navigate = useNavigate();
  const { getScheduledRevisions, getDueRevisions, getOverdueRevisions } = useRevisionSchedule();
  
  const dueRevisions = getDueRevisions();
  const overdueRevisions = getOverdueRevisions();
  const allScheduled = getScheduledRevisions();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getRevisionLabel = (type: string) => {
    switch (type) {
      case 'next_day': return '1-Day Review';
      case '3_days': return '3-Day Review';
      case '7_days': return '7-Day Review';
      default: return 'Review';
    }
  };

  if (allScheduled.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <RotateCcw className="w-4 h-4 text-primary" />
          </div>
          Smart Revision
          {dueRevisions.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {dueRevisions.length} Due
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overdue revisions first */}
        {overdueRevisions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <AlertCircle className="w-4 h-4" />
              Overdue
            </div>
            {overdueRevisions.slice(0, 2).map(rev => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center text-lg">
                  {rev.levelIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{rev.levelTitle}</p>
                  <p className="text-xs text-muted-foreground">{getRevisionLabel(rev.type)}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStartRevision?.(rev.levelId, rev.id)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Today's revisions */}
        {dueRevisions.filter(r => !overdueRevisions.includes(r)).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-accent font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Due Today
            </div>
            {dueRevisions.filter(r => !overdueRevisions.includes(r)).slice(0, 2).map(rev => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-lg">
                  {rev.levelIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{rev.levelTitle}</p>
                  <p className="text-xs text-muted-foreground">{getRevisionLabel(rev.type)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => onStartRevision?.(rev.levelId, rev.id)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming revisions */}
        {allScheduled.filter(r => !dueRevisions.includes(r)).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Calendar className="w-4 h-4" />
              Upcoming
            </div>
            {allScheduled.filter(r => !dueRevisions.includes(r)).slice(0, 3).map(rev => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                  {rev.levelIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{rev.levelTitle}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(rev.scheduledDate)} • {getRevisionLabel(rev.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          🧠 Spaced repetition helps you remember longer!
        </p>
      </CardContent>
    </Card>
  );
}
