import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Language code to full name mapping
const LANGUAGE_NAMES: Record<string, string> = {
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
  'ur': 'Urdu',
  'ne': 'Nepali',
  'sa': 'Sanskrit',
};

// Simple in-memory rate limiting (per IP, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
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

// Detect the language of the input text
async function detectLanguage(text: string): Promise<{ code: string; name: string; isEnglish: boolean }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY not configured, assuming English');
    return { code: 'en', name: 'English', isEnglish: true };
  }

  try {
    console.log('Detecting language of input text...');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a language detection expert. Analyze the given text and identify its language.
Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"code": "xx", "name": "Language Name"}

Use these language codes:
- en: English
- hi: Hindi  
- ta: Tamil
- te: Telugu
- bn: Bengali
- mr: Marathi
- gu: Gujarati
- kn: Kannada
- ml: Malayalam
- pa: Punjabi
- or: Odia
- as: Assamese
- ur: Urdu
- ne: Nepali
- sa: Sanskrit

For any other language, use the appropriate ISO 639-1 code.
Only output the JSON, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('Language detection API error:', response.status);
      return { code: 'en', name: 'English', isEnglish: true };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (content) {
      try {
        // Clean up the response - remove any markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanContent);
        const code = parsed.code?.toLowerCase() || 'en';
        const name = parsed.name || LANGUAGE_NAMES[code] || 'English';
        const isEnglish = code === 'en';
        
        console.log(`Detected language: ${name} (${code}), isEnglish: ${isEnglish}`);
        return { code, name, isEnglish };
      } catch (parseError) {
        console.error('Failed to parse language detection response:', content);
      }
    }
    
    return { code: 'en', name: 'English', isEnglish: true };
  } catch (error) {
    console.error('Language detection error:', error);
    return { code: 'en', name: 'English', isEnglish: true };
  }
}

// Translate text to English
async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured for translation');
    return text;
  }

  try {
    console.log(`Translating from ${sourceLanguage} to English...`);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Your ONLY job is to translate the input text from ${sourceLanguage} to English.

CRITICAL RULES:
1. You MUST output ONLY English text
2. DO NOT output any ${sourceLanguage} text
3. DO NOT explain or add notes
4. If the input asks about something, translate the question - do not answer it
5. The output should be a proper English sentence/question

Example:
- Input (Hindi): "संविधान क्या है?"
- Output: "What is the Constitution?"

- Input (Tamil): "அடிப்படை உரிமைகள் என்ன?"  
- Output: "What are Fundamental Rights?"

Now translate the following ${sourceLanguage} text to English. Output ONLY the English translation:`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1024,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation to English failed:', response.status, errorText);
      return text;
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (translatedText) {
      // Verify the translation is actually in English (basic check - no non-ASCII heavy text)
      const nonAsciiRatio = (translatedText.match(/[^\x00-\x7F]/g) || []).length / translatedText.length;
      if (nonAsciiRatio > 0.3) {
        console.warn('Translation may not be in English, high non-ASCII ratio:', nonAsciiRatio);
        // Try to extract any English from the response
        const englishParts = translatedText.match(/[a-zA-Z\s.,?!'"]+/g);
        if (englishParts && englishParts.join(' ').length > 10) {
          console.log('Extracted English parts from response');
          return englishParts.join(' ').trim();
        }
      }
      
      console.log('Translation to English successful');
      console.log('Original:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
      console.log('Translated:', translatedText.substring(0, 100) + (translatedText.length > 100 ? '...' : ''));
      return translatedText;
    }
    
    return text;
  } catch (error) {
    console.error('Translation to English error:', error);
    return text;
  }
}

// Translate text from English to target language
async function translateFromEnglish(text: string, targetLanguageCode: string, targetLanguageName: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured for translation');
    return text;
  }

  const languageName = targetLanguageName || LANGUAGE_NAMES[targetLanguageCode] || targetLanguageCode;

  try {
    console.log(`Translating response from English to ${languageName}...`);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in legal and constitutional terminology.
Translate the following English text to ${languageName}.

Important guidelines:
- Preserve the meaning, tone, and structure of the original text
- Use natural, fluent ${languageName} that a native speaker would use
- Maintain accuracy for legal terms and constitutional references
- Keep article numbers, section numbers, and dates in their original form
- For technical legal terms, you may keep the English term in parentheses if there's no standard translation
- Only output the translated text, nothing else. No explanations, no notes.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation from English failed:', response.status, errorText);
      return text;
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (translatedText) {
      console.log(`Translation to ${languageName} successful`);
      return translatedText;
    }
    
    return text;
  } catch (error) {
    console.error('Translation from English error:', error);
    return text;
  }
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
    
    console.log(`Constitution Chat request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const { question, language: userPreferredLanguage = 'en' } = await req.json();
    
    if (!question || typeof question !== 'string') {
      console.error('Invalid request: missing question');
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Question received:`, question.substring(0, 100) + '...');
    console.log(`User preferred language setting: ${userPreferredLanguage}`);

    const RAG_API_URL = Deno.env.get('RAG_API_URL');
    
    if (!RAG_API_URL) {
      console.error('RAG_API_URL not configured');
      return new Response(
        JSON.stringify({ error: 'RAG API not configured. Please set RAG_API_URL secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Detect the language of the input question
    const detectedLanguage = await detectLanguage(question);
    console.log(`Input language: ${detectedLanguage.name} (${detectedLanguage.code})`);

    // IMPORTANT: The response language is ALWAYS the user's preferred language setting
    // This ensures consistent output regardless of what language the user types in
    const responseLanguageCode = userPreferredLanguage;
    const responseLanguageName = LANGUAGE_NAMES[userPreferredLanguage] || 'English';
    const needsTranslation = responseLanguageCode !== 'en';

    console.log(`User selected language: ${responseLanguageName} (${responseLanguageCode})`);
    console.log(`Response will be in: ${responseLanguageName}`);

    // Step 2: Translate question to English if not already in English
    let questionForRAG = question;
    if (!detectedLanguage.isEnglish) {
      console.log('Translating question to English for RAG processing...');
      questionForRAG = await translateToEnglish(question, detectedLanguage.name);
    }

    console.log('Sending question to RAG API:', questionForRAG.substring(0, 100) + '...');

    // Step 3: Call the RAG API with the English question
    // Add a 25-second timeout for the RAG API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch(RAG_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionForRAG }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        console.error('RAG API request timed out after 25 seconds');
        return new Response(
          JSON.stringify({ error: 'The AI service is taking too long to respond. Please try again.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('RAG API fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to connect to the AI service. Please try again later.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RAG API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `RAG API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('RAG API response received');

    // Expect response format: { answer: string } or { response: string }
    let answer = data.answer || data.response || data.text || data.message;

    if (!answer) {
      console.error('Unexpected RAG API response format:', JSON.stringify(data).substring(0, 200));
      return new Response(
        JSON.stringify({ error: 'Unexpected response format from RAG API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('RAG answer (English):', answer.substring(0, 100) + '...');

    // Step 4: Translate the answer to the target language if needed
    if (needsTranslation) {
      console.log(`Translating answer to ${responseLanguageName}...`);
      answer = await translateFromEnglish(answer, responseLanguageCode, responseLanguageName);
    }

    return new Response(
      JSON.stringify({ 
        answer,
        detectedLanguage: detectedLanguage.code,
        responseLanguage: responseLanguageCode 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in constitution-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
