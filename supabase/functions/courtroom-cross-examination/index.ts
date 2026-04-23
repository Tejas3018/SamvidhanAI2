import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CASE_TYPES = [
  {
    type: "illegal_detention",
    title: "Illegal Detention Without Trial",
    brief: "Your client, a journalist, was detained for 45 days without being produced before a magistrate or informed of the charges.",
    violation: "Violation of Article 22 - Right against arbitrary detention",
    justification: "National security concerns and ongoing investigation",
    witnessRole: "Senior Police Inspector",
    witnessName: "Inspector Rajesh Sharma",
    relevantArticles: ["Article 21 - Right to Life and Personal Liberty", "Article 22 - Protection against arrest and detention"]
  },
  {
    type: "internet_shutdown",
    title: "Internet Shutdown During Protests",
    brief: "The government ordered a complete internet blackout in your client's region for 30 days during peaceful protests.",
    violation: "Violation of Article 19(1)(a) - Freedom of Speech and Expression",
    justification: "Prevention of misinformation and maintaining public order",
    witnessRole: "District Magistrate",
    witnessName: "DM Priya Verma",
    relevantArticles: ["Article 19(1)(a) - Freedom of Speech and Expression", "Article 21 - Right to Life (includes right to internet)"]
  },
  {
    type: "press_ban",
    title: "Ban on Newspaper Article",
    brief: "Your client's newspaper was banned from publishing an investigative report on government corruption.",
    violation: "Violation of Article 19(1)(a) - Freedom of Press",
    justification: "The article contained unverified allegations that could cause public unrest",
    witnessRole: "Press Information Bureau Officer",
    witnessName: "Director Anil Kapoor",
    relevantArticles: ["Article 19(1)(a) - Freedom of Speech and Expression", "Article 19(2) - Reasonable Restrictions"]
  },
  {
    type: "illegal_search",
    title: "Police Search Without Warrant",
    brief: "Police officers conducted a midnight raid on your client's home without a warrant, seizing personal documents and devices.",
    violation: "Violation of Article 21 - Right to Privacy",
    justification: "Credible intelligence about illegal activities required immediate action",
    witnessRole: "Investigating Police Officer",
    witnessName: "Sub-Inspector Meera Das",
    relevantArticles: ["Article 21 - Right to Privacy", "Article 20(3) - Protection against self-incrimination"]
  },
  {
    type: "candidate_disqualification",
    title: "Disqualification of Election Candidate",
    brief: "Your client was disqualified from contesting elections based on a pending criminal case without conviction.",
    violation: "Violation of Article 326 - Right to Contest Elections",
    justification: "Maintaining purity of electoral process and preventing criminals from contesting",
    witnessRole: "Election Commission Officer",
    witnessName: "Returning Officer Suresh Kumar",
    relevantArticles: ["Article 326 - Adult Suffrage", "Article 14 - Right to Equality"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAIAPIKEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAIAPIKEY is not configured');
    }

    const { action, caseData, conversationHistory, playerQuestion, questionMode } = await req.json();

    if (action === 'get_case') {
      const randomCase = CASE_TYPES[Math.floor(Math.random() * CASE_TYPES.length)];
      return new Response(JSON.stringify({ case: randomCase }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cross_examine') {
      const systemPrompt = `You are playing THREE roles in a courtroom cross-examination simulation about Indian Constitutional Law:

1. WITNESS: ${caseData.witnessName} (${caseData.witnessRole})
2. OPPOSING COUNSEL: A skilled government lawyer defending the state's actions
3. JUDGE: An evaluator who occasionally provides subtle feedback

CASE CONTEXT:
- Case: ${caseData.title}
- Brief: ${caseData.brief}
- Alleged Violation: ${caseData.violation}
- Government Justification: ${caseData.justification}

YOUR BEHAVIOR AS WITNESS:
- Stay in character as ${caseData.witnessRole}
- Defend your position but be realistic
- Sometimes evade difficult questions
- Occasionally contradict earlier statements if pressed hard
- Show discomfort when caught in logical traps
- Reveal weaknesses ONLY if questioned skillfully

YOUR BEHAVIOR AS OPPOSING COUNSEL:
- Object when questions are irrelevant or leading (use "OBJECTION:" prefix)
- Try to reframe damaging answers
- Defend the government's position
- Be strategic but not unfair

YOUR BEHAVIOR AS JUDGE:
- Provide subtle feedback on question quality
- Note when the player makes good constitutional arguments
- Point out when questioning drifts from core issues
- Use "COURT NOTES:" prefix for judge observations

RESPONSE FORMAT (JSON):
{
  "witnessResponse": "The witness's answer to the question",
  "opposingCounselAction": "OBJECTION: reason" or "REDIRECT: clarification" or null,
  "judgeNote": "Brief observation about the questioning" or null,
  "witnessEmotionalState": "confident" | "nervous" | "evasive" | "defensive" | "uncomfortable",
  "logicalPressureChange": number between -10 and 10,
  "constitutionalStrengthChange": number between -10 and 10,
  "credibilityDamageChange": number between -10 and 10,
  "isContradiction": boolean (true if witness contradicted earlier statement)
}

Remember: Make the experience challenging but fair. The player should feel like a real lawyer.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === 'player' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: `PLAYER'S QUESTION (${questionMode}): ${playerQuestion}` }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.8,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_verdict') {
      const systemPrompt = `You are a constitutional law expert evaluating a cross-examination session.

CASE: ${caseData.title}
VIOLATION ALLEGED: ${caseData.violation}
RELEVANT ARTICLES: ${caseData.relevantArticles.join(', ')}

Analyze the cross-examination and provide a verdict assessment.

RESPONSE FORMAT (JSON):
{
  "effectivenessScore": number 1-10,
  "constitutionalGrounding": "Strong" | "Medium" | "Weak",
  "witnessCredibility": "Exposed" | "Damaged" | "Intact",
  "caseOutcome": "Favorable" | "Uncertain" | "Weak",
  "strengths": ["list of 2-3 things done well"],
  "improvements": ["list of 2-3 areas to improve"],
  "relevantArticlesExplained": [
    {"article": "Article XX", "explanation": "Brief explanation of relevance"}
  ],
  "realCaseReference": "Name of a similar real case with brief description",
  "xpEarned": number between 50-200,
  "badges": ["list of earned badge names if any"]
}

Be encouraging but honest. Focus on constitutional learning.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CONVERSATION HISTORY:\n${JSON.stringify(conversationHistory, null, 2)}\n\nFinal Scores:\n- Logical Pressure: ${caseData.logicalPressure}/100\n- Constitutional Strength: ${caseData.constitutionalStrength}/100\n- Credibility Damage: ${caseData.credibilityDamage}/100` }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const verdict = JSON.parse(data.choices[0].message.content);

      return new Response(JSON.stringify(verdict), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});