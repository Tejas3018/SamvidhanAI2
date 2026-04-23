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

const GAME_PROMPT = `GAME: AI vs You Debate

You are participating in a constitutional debate game. Your role is to:
- Present strong constitutional arguments
- Use accurate Article citations
- Be challenging but educational
- Score user responses fairly

Output Format for Opening:
1. AI Opening Argument (max 120 words)
2. Articles Used
3. Ask User: "Present your constitutional rebuttal."`;

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
    
    console.log(`AI Debate request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const { action, topic, difficulty, aiArgument, aiArticles, userRebuttal, round, isMultiRound, maxRounds } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAIAPIKEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (action === 'ai_opening') {
      const difficultyGuide = {
        beginner: 'Use 1-2 simple, well-known Articles. Keep argument straightforward.',
        intermediate: 'Use 2-3 Articles including some nuanced interpretations. Add complexity.',
        advanced: 'Use 3-4 Articles with sophisticated legal reasoning. Include case law references.'
      };

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
              content: `Topic: ${topic}
Difficulty: ${difficulty}
Round: ${round}

${difficultyGuide[difficulty as keyof typeof difficultyGuide]}

Take a strong constitutional stance on this topic. Present your opening argument.

Respond in JSON format:
{
  "argument": "Your opening argument here (max 120 words, compelling and constitutional)",
  "articlesUsed": ["Article X", "Article Y"],
  "stance": "Brief description of your position"
}`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI error:', errorText);
        throw new Error('Failed to generate AI argument');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        argument: content,
        articlesUsed: [],
        stance: topic
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'evaluate_and_counter') {
      const multiRoundContext = isMultiRound 
        ? `\n\nThis is Round ${round} of ${maxRounds} in a multi-round debate. ${
            round < maxRounds 
              ? 'Provide a strong counter-argument to continue the debate.' 
              : 'This is the final round. Provide comprehensive feedback and learning points.'
          }`
        : '';

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
              content: `Evaluate this constitutional debate:

Topic: ${topic}
Difficulty: ${difficulty}
Round: ${round}${isMultiRound ? ` of ${maxRounds}` : ''}${multiRoundContext}

AI's ${round > 1 ? 'Previous Counter-' : 'Opening '}Argument:
${aiArgument}

AI's Articles Used: ${aiArticles?.join(', ')}

User's Rebuttal:
${userRebuttal}

Evaluate the user's rebuttal and provide your counter-argument.

Scoring Criteria (each out of 100):
1. Article Usage Score: Did user cite relevant Articles correctly? Are citations accurate?
2. Logical Coherence Score: Is the argument well-structured and logical?
3. Constitutional Validity Score: Is the interpretation constitutionally sound?

Respond in JSON format:
{
  "articleUsageScore": 75,
  "logicalCoherenceScore": 80,
  "constitutionalValidityScore": 70,
  "totalScore": 75,
  "feedback": "Specific feedback on user's debate performance for this round",
  "aiCounterArgument": "Your counter-argument to the user's rebuttal (max 100 words). Make it challenging but educational.${isMultiRound && round < maxRounds ? ' This will be the basis for the next round.' : ''}",
  "aiArticlesUsed": ["Article X", "Article Y"],
  "learningPoints": "Key constitutional principles learned from this ${isMultiRound ? 'debate so far' : 'debate'}",
  "winner": "user" or "ai" or "tie"
}

Be fair but challenging. User wins if totalScore >= 70. Tie if 50-69. AI wins if < 50.`
            }
          ],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI error:', errorText);
        throw new Error('Failed to evaluate debate');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

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
    console.error('Error in ai-debate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
