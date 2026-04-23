import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported languages
const supportedLanguages: Record<string, string> = {
  'en': 'English',
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'bn': 'Bengali',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'ur': 'Urdu'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions, targetLanguage } = await req.json();
    
    // If target language is English, return as-is
    if (targetLanguage === 'en') {
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      throw new Error('GEMINI_API_KEY not configured');
    }

    const languageName = supportedLanguages[targetLanguage] || 'Hindi';
    console.log(`Translating ${questions.length} questions to ${languageName}`);

    const systemPrompt = `You are a professional translator specializing in educational content translation. Translate the following quiz questions from English to ${languageName}. 

IMPORTANT RULES:
1. Maintain the exact JSON structure
2. Translate: question, options, explanation
3. DO NOT translate: article numbers (like "Article 14"), proper nouns (names of people, places), legal terms that are commonly used in English
4. Keep the correctAnswer index exactly the same
5. Keep articleReference in English (it's a reference identifier)
6. Ensure translations are culturally appropriate and educational
7. Return ONLY valid JSON array, no extra text or markdown`;

    const userPrompt = `Translate this JSON array of quiz questions to ${languageName}:

${JSON.stringify(questions, null, 2)}

Return ONLY the translated JSON array with the same structure.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in Lovable AI response');
      throw new Error('No translation content received');
    }

    // Parse the JSON from the response
    let translatedQuestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        translatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        translatedQuestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse translated questions:', parseError, 'Content:', content);
      // Return original questions if translation fails
      return new Response(JSON.stringify({ questions, translationFailed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully translated ${translatedQuestions.length} questions to ${languageName}`);

    return new Response(JSON.stringify({ questions: translatedQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in translate-questions function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
