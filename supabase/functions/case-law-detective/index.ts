import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GLOBAL_SYSTEM_PROMPT = `You are an AI Constitutional Learning Engine.

Your role is to:
- Teach the Indian Constitution in a simple, accurate, and engaging way
- Never hallucinate articles, cases, or amendments
- Use only verified constitutional knowledge (prefer retrieved context)
- Encourage learning through reasoning, not memorization

Rules:
1. If unsure, say "Not enough constitutional basis"
2. Always cite relevant Articles (number + short explanation)
3. Adjust difficulty based on user_level
4. Be neutral, constitutional, and educational`;

const GAME_PROMPT = `GAME: Case Law Detective

You are running a Case Law Detective game where users investigate famous Indian constitutional cases.

Instructions:
- Identify constitutional issues
- Predict judgment
- Reveal case name only at the end

Output Format:
1. Constitutional Issues:
2. Articles Involved:
3. Predicted Judgment:
4. Actual Case:
   - Name:
   - Final Verdict:
5. What the student should learn:`;

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

serve(async (req) => {
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
    
    console.log(`Case Law Detective request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const { action, difficulty, advancedMode, caseSummary, userArticles, userPrediction } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAIAPIKEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (action === 'generate_case') {
      const difficultyPrompts = {
        beginner: 'Generate a case from basic fundamental rights cases like Maneka Gandhi, Vishaka, or Kesavananda Bharati. Keep the facts straightforward.',
        intermediate: 'Generate a case involving complex constitutional interpretation like Minerva Mills, S.R. Bommai, or I.R. Coelho. Include some nuanced facts.',
        advanced: 'Generate a challenging case like Navtej Singh Johar, Sabarimala, or K.S. Puttaswamy. Include complex constitutional questions.'
      };

      const hideCaseName = advancedMode ? 'Do NOT reveal the case name in the summary. Replace any mention of the case name with "[Case Name Redacted]".' : '';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: GLOBAL_SYSTEM_PROMPT },
            { 
              role: 'user', 
              content: `${difficultyPrompts[difficulty as keyof typeof difficultyPrompts]}

${hideCaseName}

Generate a case summary for the Case Law Detective game. The summary should:
1. Present the key facts of a real, landmark Indian constitutional case
2. Include the parties involved and the dispute
3. Hint at the constitutional issues without explicitly stating which articles apply
4. Be engaging and educational

Respond in JSON format:
{
  "caseSummary": "The case summary here...",
  "hiddenFacts": ["fact1 that was omitted", "fact2 that was omitted"]
}`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI error:', errorText);
        throw new Error('Failed to generate case');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        caseSummary: content,
        hiddenFacts: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'evaluate') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${GLOBAL_SYSTEM_PROMPT}\n\n${GAME_PROMPT}` },
            { 
              role: 'user', 
              content: `Evaluate this Case Law Detective submission:

Case Summary Given:
${caseSummary}

User's Identified Articles:
${userArticles}

User's Predicted Judgment:
${userPrediction}

Difficulty Level: ${difficulty}

Provide a comprehensive evaluation in JSON format:
{
  "constitutionalIssues": ["issue1", "issue2"],
  "articlesInvolved": [
    {"article": "Article X", "explanation": "Why this article applies"},
    {"article": "Article Y", "explanation": "Why this article applies"}
  ],
  "predictedJudgment": "What the correct judgment reasoning should be",
  "actualCase": {
    "name": "The actual case name",
    "finalVerdict": "What the court actually decided"
  },
  "learningPoints": "Key constitutional principles from this case",
  "score": 75,
  "feedback": "Specific feedback on user's analysis, what they got right, what they missed"
}

Score criteria:
- 40 points for correctly identifying relevant articles
- 40 points for accurate judgment prediction
- 20 points for understanding constitutional issues

Be encouraging but accurate. Highlight both strengths and areas for improvement.`
            }
          ],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI error:', errorText);
        throw new Error('Failed to evaluate submission');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Invalid response format');
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in case-law-detective:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
