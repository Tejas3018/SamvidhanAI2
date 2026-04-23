import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code to relevance language mapping for YouTube API
const languageMap: Record<string, string> = {
  'en': 'en',
  'hi': 'hi',
  'ta': 'ta',
  'te': 'te',
  'bn': 'bn',
  'mr': 'mr',
  'gu': 'gu',
  'kn': 'kn',
  'ml': 'ml',
  'pa': 'pa',
};

// Simple in-memory rate limiting (per IP, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // requests per window (higher for YouTube as it's less costly)
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional authentication - log user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // Auth failed, but allow anonymous access
      }
    }
    
    console.log(`YouTube Search request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const { query, maxResults = 4, languageCode = 'en' } = await req.json();
    
    if (!query) {
      console.error("No query provided");
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    
    if (!YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const relevanceLanguage = languageMap[languageCode] || 'en';
    
    console.log(`Searching YouTube for: "${query}" in language: ${relevanceLanguage} with maxResults: ${maxResults}`);

    // Search specifically for Indian Constitution educational videos
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&videoDuration=medium&relevanceLanguage=${relevanceLanguage}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch videos from YouTube" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} videos`);

    // Get video details for duration
    const videoIds = data.items?.map((item: any) => item.id.videoId).join(',');
    
    if (!videoIds) {
      return new Response(
        JSON.stringify({ videos: [], message: "No videos found in this language" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    // Format the response
    const videos = detailsData.items?.map((item: any) => {
      // Parse ISO 8601 duration to readable format
      const duration = item.contentDetails.duration;
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = match?.[1] ? parseInt(match[1]) : 0;
      const minutes = match?.[2] ? parseInt(match[2]) : 0;
      const seconds = match?.[3] ? parseInt(match[3]) : 0;
      
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      return {
        id: item.id,
        title: item.snippet.title,
        duration: formattedDuration,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle
      };
    }) || [];

    console.log(`Returning ${videos.length} formatted videos`);

    return new Response(
      JSON.stringify({ videos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in youtube-search function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
