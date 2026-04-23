import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeVideo } from '@/types';

interface SearchResult {
  videos: YouTubeVideo[];
  noResults: boolean;
}

export function useYouTubeSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVideos = async (topic: string, maxResults = 4, languageCode = 'en'): Promise<SearchResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
        body: { query: topic, maxResults, languageCode }
      });

      if (fnError) {
        console.error('YouTube search error:', fnError);
        setError('Failed to search videos');
        return { videos: [], noResults: true };
      }

      if (data?.error) {
        console.error('YouTube API error:', data.error);
        setError(data.error);
        return { videos: [], noResults: true };
      }

      const videos = data?.videos || [];
      return { videos, noResults: videos.length === 0 };
    } catch (err) {
      console.error('YouTube search error:', err);
      setError('Failed to search videos');
      return { videos: [], noResults: true };
    } finally {
      setIsLoading(false);
    }
  };

  return { searchVideos, isLoading, error };
}
