import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert on Indian Constitutional Law and Fundamental Rights. You work as an AI assistant for a "Rights Violation Hotline" educational game.

Your role is to:
1. Generate realistic complaint scenarios about rights violations in India
2. Evaluate user responses on classifying issues, identifying violated rights, and suggesting remedies
3. Provide educational feedback

Always be accurate about:
- Fundamental Rights (Part III of Indian Constitution)
- Relevant Articles (14-32, 21A, etc.)
- Legal remedies (writs, PILs, commissions, tribunals)
- Landmark case references when applicable

Keep responses educational, engaging, and practical.`;

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 30) return false;
  limit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAIAPIKEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, difficulty, complaint, userResponse } = await req.json();

    let prompt = '';
    let responseFormat = '';

    if (action === 'generate_complaint') {
      const difficultyDescriptions: Record<string, string> = {
        easy: 'simple, clear-cut violations of basic rights like Right to Equality, Education, or Life',
        medium: 'moderately complex scenarios involving workplace rights, detention, or discrimination with some nuance',
        hard: 'complex scenarios involving multiple rights, constitutional procedures, or landmark case-like situations'
      };

      prompt = `Generate a realistic complaint for a Rights Violation Hotline game.

Difficulty: ${difficulty || 'medium'}
Description: ${difficultyDescriptions[difficulty || 'medium']}

Create a complaint that a citizen might call in about. Make it feel authentic and emotional.

Return a JSON object with:
{
  "complaint": "The caller's complaint in first person, 2-3 sentences max",
  "callerName": "A realistic Indian name",
  "callerBackground": "Brief background (e.g., 'Factory worker from Gujarat')",
  "category": "One of: Employment, Education, Detention, Discrimination, Expression, Religion, Property, Other",
  "violatedRights": ["Array of violated articles/rights"],
  "correctCategory": "The correct category",
  "correctRemedies": ["Array of appropriate legal remedies"],
  "explanation": "Brief explanation of why these rights are violated and these remedies apply",
  "relatedCase": "A relevant landmark case if applicable, or null"
}`;
      responseFormat = 'json';
    } else if (action === 'evaluate_response') {
      prompt = `Evaluate the user's response to a rights violation complaint.

COMPLAINT: "${complaint}"

USER'S RESPONSE:
- Category selected: ${userResponse.category}
- Violated Rights identified: ${userResponse.violatedRights?.join(', ') || 'None selected'}
- Suggested Remedy: ${userResponse.remedy}

Evaluate how well the user:
1. Classified the issue (category accuracy)
2. Identified the violated rights (which articles/rights apply)
3. Suggested an appropriate legal remedy

Return a JSON object with:
{
  "categoryScore": 0-100,
  "categoryFeedback": "Feedback on category selection",
  "rightsScore": 0-100,
  "rightsFeedback": "Feedback on rights identification",
  "remedyScore": 0-100,
  "remedyFeedback": "Feedback on suggested remedy",
  "overallScore": 0-100,
  "correctAnswer": {
    "category": "Correct category",
    "violatedRights": ["Correct rights with article numbers"],
    "remedies": ["Correct remedies"]
  },
  "learningTip": "A practical tip for remembering this type of case",
  "relatedCase": "A landmark case reference if relevant, or null"
}`;
      responseFormat = 'json';
    } else {
      throw new Error('Invalid action');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rights Hotline error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
