import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supportedLanguages: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi',
  gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
  or: 'Odia', as: 'Assamese', ur: 'Urdu',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetLanguage } = await req.json();

    if (!targetLanguage || targetLanguage === 'en') {
      return new Response(JSON.stringify({ translated: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const langName = supportedLanguages[targetLanguage];
    if (!langName) {
      return new Response(JSON.stringify({ error: 'Unsupported language' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const isString = typeof content === 'string';
    const isArray = Array.isArray(content);
    const isObject = !isString && !isArray && typeof content === 'object';

    const systemPrompt = `You are a professional translator for Indian constitutional education content. Translate to ${langName}.

Rules:
- Preserve Article numbers, case names, and legal citations in English
- Keep proper nouns, abbreviations (UPSC, SSC, PIL) in English
- Keep numbers, emojis, and formatting as-is
- Translations should be natural and educational
- Return ONLY the translated content in the same format (no explanation)`;

    let userPrompt: string;
    if (isString) {
      userPrompt = `Translate this text to ${langName}. Return ONLY the translated text:\n\n${content}`;
    } else {
      userPrompt = `Translate all string values in this JSON to ${langName}. Return ONLY the JSON:\n\n${JSON.stringify(content)}`;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content || '';

    let translated: any;
    if (isString) {
      // For string content, return the raw text (strip any quotes)
      translated = responseContent.replace(/^["']|["']$/g, '').trim();
    } else {
      // For object/array content, parse JSON
      try {
        const jsonMatch = responseContent.match(/[\[{][\s\S]*[\]}]/);
        translated = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseContent);
      } catch {
        console.error('Failed to parse translation:', responseContent.substring(0, 300));
        translated = content; // fallback to original
      }
    }

    return new Response(JSON.stringify({ translated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('translate-content error:', error);
    return new Response(JSON.stringify({ error: error.message, translated: null }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
