import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GLOBAL_SYSTEM_PROMPT = `You are an AI Constitutional Learning Engine specializing in the Indian Constitution.

Your role is to:
- Teach the Indian Constitution in a simple, accurate, and engaging way
- Never hallucinate articles, cases, or amendments
- Use only verified constitutional knowledge
- Encourage learning through reasoning, not memorization

Rules:
1. If unsure, say "Not enough constitutional basis"
2. Always cite relevant Articles (number + short explanation)
3. Adjust difficulty based on user level
4. Be neutral, constitutional, and educational`;

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
    
    console.log(`Constitutional Courtroom request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const body = await req.json();
    const { action } = body;

    const OPENAI_API_KEY = Deno.env.get('OPENAIAPIKEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Handle scenario generation
    if (action === 'generate_scenarios') {
      const { level, count = 3 } = body;
      
      const scenarioPrompt = `Generate ${count} unique constitutional court case scenarios for the Indian Constitution at ${level} difficulty level.

Each scenario should be:
- Beginner: Clear-cut fundamental rights cases with obvious constitutional violations
- Intermediate: Cases involving conflicting rights or complex interpretations
- Advanced: Nuanced cases requiring deep constitutional knowledge and landmark case references

Return ONLY valid JSON in this exact format:
{
  "scenarios": [
    {
      "title": "Short descriptive title",
      "description": "2-3 sentence description of the case facts",
      "context": "Additional context about the dispute",
      "articles": ["Article X", "Article Y"]
    }
  ]
}

Make scenarios realistic, educational, and based on real constitutional principles. Include diverse topics like:
- Fundamental rights (Part III)
- Directive principles conflicts
- Center-State relations
- Emergency provisions
- Amendment challenges
- Recent constitutional developments`;

      console.log('Generating scenarios with OpenAI...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: GLOBAL_SYSTEM_PROMPT },
            { role: 'user', content: scenarioPrompt }
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || '';
      
      let result;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        result = { scenarios: [] };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle argument evaluation (default action)
    const { role, level, scenario, userArgument, selectedArticles } = body;

    const gamePrompt = `GAME: Constitutional Courtroom

User Role: ${role} (${role === 'judge' ? 'Analyze and deliver verdict' : role === 'petitioner' ? 'Argue for the aggrieved' : 'Defend the opposing party'})
User Level: ${level} (${level === 'beginner' ? 'Basic concepts' : level === 'intermediate' ? 'Complex applications' : 'Advanced jurisprudence'})

Scenario Title: ${scenario.title}
Scenario Description: ${scenario.description}
Context: ${scenario.context}

User's Selected Articles: ${selectedArticles.join(', ')}

User's Argument:
"${userArgument}"

Instructions:
- Evaluate the user's constitutional reasoning based on their role
- Identify all relevant Articles involved (correct ones, not just what user selected)
- Apply constitutional reasoning based on the role
- Avoid political opinions
- Keep explanations concise but educational

You MUST respond with valid JSON in this exact format:
{
  "relevantArticles": [
    { "article": "Article X", "reason": "Brief explanation of relevance" }
  ],
  "argument": "Model argument from the user's role perspective (2-3 paragraphs)",
  "outcome": "Final verdict/relief/dismissal based on constitutional principles",
  "learningTakeaway": "1-2 lines summarizing the key constitutional lesson",
  "score": 75,
  "feedback": "Detailed feedback on the user's argument - what was good, what could be improved, and constitutional points they may have missed"
}

Score Guidelines:
- 90-100: Excellent - Identified all key articles, strong legal reasoning, comprehensive argument
- 70-89: Good - Identified most articles, reasonable argument, minor gaps
- 50-69: Average - Some relevant points, needs more constitutional depth
- Below 50: Needs improvement - Missing key articles or flawed reasoning

Evaluate fairly but educationally. Encourage learning.`;

    console.log('Calling OpenAI for Constitutional Courtroom evaluation...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: GLOBAL_SYSTEM_PROMPT },
          { role: 'user', content: gamePrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    console.log('AI Response received:', content.substring(0, 200));

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      result = {
        relevantArticles: [
          { article: "Article 14", reason: "Right to equality - foundational principle" },
          { article: "Article 21", reason: "Right to life and liberty" }
        ],
        argument: "Based on constitutional principles, the case involves fundamental rights that must be balanced with reasonable restrictions. The Constitution provides a framework for resolving such disputes.",
        outcome: "The case requires careful consideration of competing constitutional values.",
        learningTakeaway: "Constitutional law requires balancing individual rights with societal interests.",
        score: 60,
        feedback: "Your argument shows understanding of basic constitutional concepts. Focus on citing specific articles and their interpretations in landmark cases to strengthen your reasoning."
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in constitutional-courtroom:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
