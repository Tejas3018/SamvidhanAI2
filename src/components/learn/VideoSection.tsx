import { useState } from 'react';
import { YouTubeVideo } from '@/types';
import { Play, CheckCircle2, Clock, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';

interface VideoSectionProps {
  topics: string[];
  onAllWatched: () => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
];

export function VideoSection({ topics, onAllWatched }: VideoSectionProps) {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [language, setLanguage] = useState('en');
  const [noVideosFound, setNoVideosFound] = useState(false);
  const { searchVideos, isLoading, error } = useYouTubeSearch();

  const handleFetchVideos = async () => {
    const langName = languages.find(l => l.code === language)?.name || 'English';
    // Build a focused search query with specific topic and language
    const topicQuery = topics.slice(0, 2).join(' ');
    const query = `"Indian Constitution" ${topicQuery} ${langName}`;
    
    const result = await searchVideos(query, 4, language);
    
    setVideos(result.videos);
    setNoVideosFound(result.noResults);
    setWatchedVideos(new Set());
    setCurrentVideo(null);
  };

  const handleVideoClick = (videoId: string) => {
    setCurrentVideo(videoId);
  };

  const handleMarkWatched = (videoId: string) => {
    const newWatched = new Set(watchedVideos);
    newWatched.add(videoId);
    setWatchedVideos(newWatched);
    
    if (newWatched.size === videos.length && videos.length > 0) {
      onAllWatched();
    }
  };

  const allWatched = videos.length > 0 && watchedVideos.size === videos.length;
  const watchedCount = watchedVideos.size;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">📺 Learn First</h2>
          <p className="text-muted-foreground">Search for videos to understand the concepts</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleFetchVideos}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Videos
              </>
            )}
          </Button>
          {videos.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{watchedCount}/{videos.length} watched</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Empty state - no videos loaded yet */}
      {videos.length === 0 && !isLoading && !noVideosFound && (
        <div className="bg-muted/30 border border-border rounded-xl p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No videos loaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Select your preferred language and click "Find Videos" to search for educational content about: <strong>{topics.slice(0, 2).join(', ')}</strong>
          </p>
        </div>
      )}

      {/* No videos found in language */}
      {noVideosFound && videos.length === 0 && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="font-semibold text-lg mb-2 text-destructive">No videos found in {languages.find(l => l.code === language)?.name}</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find videos about <strong>{topics.slice(0, 2).join(', ')}</strong> in {languages.find(l => l.code === language)?.name}. Try selecting a different language.
          </p>
        </div>
      )}

      {/* Video player */}
      {currentVideo && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {videos.find(v => v.id === currentVideo)?.title}
            </span>
            {!watchedVideos.has(currentVideo) && (
              <Button
                size="sm"
                onClick={() => handleMarkWatched(currentVideo)}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Watched
              </Button>
            )}
            {watchedVideos.has(currentVideo) && (
              <span className="flex items-center gap-1.5 text-sm text-accent">
                <CheckCircle2 className="w-4 h-4" />
                Watched
              </span>
            )}
          </div>
        </div>
      )}

      {/* Video list */}
      {videos.length > 0 && (
        <div className="grid gap-3">
          {videos.map((video, index) => {
            const isWatched = watchedVideos.has(video.id);
            const isCurrent = currentVideo === video.id;
            
            return (
              <button
                key={video.id}
                onClick={() => handleVideoClick(video.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left w-full group ${
                  isCurrent
                    ? 'bg-primary/10 border-primary'
                    : isWatched
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  isWatched ? 'bg-accent/20' : 'bg-primary/10'
                }`}>
                  {isWatched ? (
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  ) : (
                    <Play className="w-6 h-6 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Video {index + 1}</span>
                    {isWatched && (
                      <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">Completed</span>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{video.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{video.duration}</span>
                  </div>
                </div>
                
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isCurrent ? 'rotate-90' : 'group-hover:translate-x-1'
                }`} />
              </button>
            );
          })}
        </div>
      )}

      {/* CTA to quiz */}
      {allWatched && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              🎉
            </div>
            <div>
              <p className="font-medium text-accent">All videos watched!</p>
              <p className="text-sm text-muted-foreground">You're ready to take the quiz</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
