import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAIAPIKEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, round, choice, democracyHealth, allChoices } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'evaluate_choice') {
      systemPrompt = `You are a historian and constitutional expert analyzing decisions made during India's 1975 Emergency.
      
You must evaluate the player's choice and provide:
1. An immediate consequence (2-3 sentences, dramatic and immersive)
2. The impact on democracy health (a number between -30 and +10)
3. A brief historical note (1 sentence about what actually happened)

Respond in JSON format:
{
  "consequence": "string",
  "healthImpact": number,
  "historicalNote": "string"
}`;

      const roundContexts = {
        judiciary: `Round: Courts & Judiciary
Situation: Courts are receiving petitions challenging the Emergency. Judges want to review detentions and rights suspension under Article 359.
Player chose: ${choice}
Current Democracy Health: ${democracyHealth}%`,
        press: `Round: Press & Media
Situation: Newspapers are publishing criticism of the Emergency. Protests are rising. Article 19 (Freedom of Speech) is at stake.
Player chose: ${choice}
Current Democracy Health: ${democracyHealth}%`,
        elections: `Round: Elections
Situation: The Emergency is about to end. Public demand for elections is rising. The fate of democracy hangs in balance.
Player chose: ${choice}
Current Democracy Health: ${democracyHealth}%`
      };

      userPrompt = roundContexts[round as keyof typeof roundContexts] || '';
    } else if (action === 'final_analysis') {
      systemPrompt = `You are a historian providing a final analysis of the 1975 Emergency simulation.
      
Analyze the player's choices and compare them to actual history. Be educational but engaging.

The player made these choices:
${JSON.stringify(allChoices, null, 2)}

Final Democracy Health: ${democracyHealth}%

Respond in JSON format:
{
  "playerOutcome": "string (2-3 sentences about what would happen with these choices)",
  "historicalReality": "string (2-3 sentences about what actually happened in 1977)",
  "keyLessons": ["lesson1", "lesson2", "lesson3"],
  "verdictTitle": "string (short dramatic title for their playthrough)",
  "democracySurvived": boolean
}`;

      userPrompt = `Analyze the complete playthrough and provide the final verdict.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in emergency-1975 function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
