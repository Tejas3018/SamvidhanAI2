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
    const { policy, decision, type } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAIAPIKEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAIAPIKEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'simulate') {
      systemPrompt = `You are an AI election policy analyst simulating the impact of electoral policies in India.

Your task is to analyze an election policy and simulate its demographic impact.

You must respond with a valid JSON object with this exact structure:
{
  "demographicImpacts": [
    {
      "group": "Rural voters",
      "changePercent": -12,
      "direction": "decrease",
      "explanation": "Brief 1-line explanation"
    },
    {
      "group": "Urban voters",
      "changePercent": 5,
      "direction": "increase",
      "explanation": "Brief 1-line explanation"
    },
    {
      "group": "Minority groups",
      "changePercent": -8,
      "direction": "decrease",
      "explanation": "Brief 1-line explanation"
    },
    {
      "group": "Youth voters",
      "changePercent": 3,
      "direction": "increase",
      "explanation": "Brief 1-line explanation"
    },
    {
      "group": "Women voters",
      "changePercent": -5,
      "direction": "decrease",
      "explanation": "Brief 1-line explanation"
    }
  ],
  "overallTurnoutChange": -4,
  "summary": "Brief 2-sentence summary of overall impact"
}

Consider realistic effects based on:
- Infrastructure access differences
- Economic disparities
- Social barriers
- Historical voting patterns

The decision type affects severity:
- "implement": Full impact
- "modify": Reduced impact (halved)
- "reject": No negative impact, slight positive from status quo

Be realistic and evidence-based in your simulation.`;

      userPrompt = `Policy: "${policy.title}"
Description: ${policy.description}
Decision: ${decision}

Simulate the demographic impact of this policy decision on Indian elections.`;

    } else if (type === 'constitutional-review') {
      systemPrompt = `You are a constitutional law expert analyzing election policies under the Indian Constitution.

Analyze the policy for constitutional validity considering:
- Article 14 (Equality before law)
- Article 15 (Prohibition of discrimination)
- Article 19 (Right to political participation)
- Article 324 (Election Commission powers)
- Article 326 (Universal adult suffrage)

You must respond with a valid JSON object:
{
  "articles": [
    {
      "article": "Article 14",
      "status": "potential_violation",
      "explanation": "Brief explanation of concern"
    },
    {
      "article": "Article 15",
      "status": "compliant",
      "explanation": "Brief explanation"
    }
  ],
  "courtChallenges": [
    "Possible challenge description 1",
    "Possible challenge description 2"
  ],
  "courtRiskLevel": 75,
  "riskExplanation": "Brief explanation of why this risk level",
  "judicialPrediction": "Brief prediction of court outcome"
}

courtRiskLevel is 0-100 where:
- 0-30: Low risk
- 31-60: Medium risk
- 61-100: High risk

status can be: "compliant", "potential_violation", "clear_violation"`;

      userPrompt = `Policy: "${policy.title}"
Description: ${policy.description}
Decision taken: ${decision}

Analyze the constitutional validity of this election policy.`;

    } else if (type === 'final-outcome') {
      systemPrompt = `You are an election policy analyst providing final assessment and educational insights.

Based on the simulation results, provide a comprehensive final outcome.

You must respond with a valid JSON object:
{
  "scores": {
    "democracy": 68,
    "fairness": 55,
    "inclusion": 45,
    "legalStability": 40
  },
  "realWorldComparison": "Brief comparison to similar policies in other democracies",
  "learnings": [
    "Key learning point 1",
    "Key learning point 2",
    "Key learning point 3"
  ],
  "reflectionQuestion": "A thought-provoking question for the student",
  "badges": [
    {
      "id": "fair_advocate",
      "name": "Fair Representation Advocate",
      "earned": false,
      "requirement": "Inclusion Score > 70%"
    },
    {
      "id": "democracy_defender",
      "name": "Democracy Defender",
      "earned": true,
      "requirement": "Court Risk Low"
    },
    {
      "id": "policy_thinker",
      "name": "Policy Thinker",
      "earned": true,
      "requirement": "Completed simulation"
    }
  ]
}

Scores are 0-100:
- democracy: Overall democratic health
- fairness: Equal treatment of groups
- inclusion: Accessibility for marginalized
- legalStability: Constitutional soundness

Award badges based on actual scores.`;

      userPrompt = `Policy: "${policy.title}"
Decision: ${decision}
Demographic Impact Summary: ${JSON.stringify(policy.demographicImpacts)}
Court Risk Level: ${policy.courtRiskLevel}%

Provide the final outcome assessment and learning points.`;
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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in voter-impact-simulator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
