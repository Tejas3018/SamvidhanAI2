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
    const { keys, targetLanguage } = await req.json();

    if (!targetLanguage || targetLanguage === 'en') {
      return new Response(JSON.stringify({ translations: keys }), {
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

    const systemPrompt = `You are a professional translator specializing in Indian languages. Translate UI text from English to ${langName}.

Rules:
- Return a valid JSON object with the same keys as the input
- Keep proper nouns like "Samvidhan", "UPSC", "SSC" in English
- Keep constitutional terms like "Article", "Amendment" in their commonly used form in ${langName}
- Keep numbers, emojis, and special characters as-is
- Translations should be natural and concise (UI labels)
- Do NOT add any explanation, just return the JSON object`;

    const userPrompt = `Translate all values in this JSON object to ${langName}. Return ONLY the JSON:\n\n${JSON.stringify(keys)}`;

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
        return new Response(JSON.stringify({ error: 'Rate limited. Please try again later.' }), {
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
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    let translations: Record<string, string>;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      translations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error('Failed to parse translation response:', content.substring(0, 500));
      return new Response(JSON.stringify({ translations: keys, translationFailed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('translate-ui error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
