import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAIAPIKEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, levelTitle, type, userAnswer, articleReference, relatedArticles } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'evaluate-explanation') {
      // Evaluate user's explanation of a constitutional concept
      systemPrompt = `You are an expert on the Indian Constitution and an educational evaluator. Evaluate a student's explanation of a constitutional topic. Be encouraging but honest.

Your response MUST be valid JSON with this exact structure:
{
  "score": <number 1-10>,
  "overall": "<brief overall assessment in 1-2 sentences>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "correctExplanation": "<a model explanation of the topic in 2-3 sentences>"
}`;

      userPrompt = `Topic: ${topic}
${articleReference ? `Related Article: ${articleReference}` : ''}

Student's Explanation:
"${userAnswer}"

Evaluate this explanation on:
1. Correctness - Is the information accurate?
2. Clarity - Is it clearly explained?
3. Completeness - Does it cover key aspects?

Provide your evaluation as JSON.`;
    } else if (type === 'real-life-event') {
      // Explain how a real-life event connects to the Constitution
      systemPrompt = `You are an expert on the Indian Constitution and Indian history. Explain how a real-life historical or current event connects to constitutional provisions. Be clear and educational.`;

      userPrompt = `Event/Topic: ${topic}
Related Constitutional Articles: ${relatedArticles?.join(', ') || 'Various'}

Explain in 150-200 words:
1. How this event relates to the Constitution
2. Which specific articles/provisions are relevant
3. The constitutional significance of this event
4. Any landmark judgments or changes that resulted

Keep it engaging and educational for students learning about the Constitution.`;
    } else {
      // Default: explain a topic
      systemPrompt = `You are an expert on the Indian Constitution. When given a topic related to the Indian Constitution, provide a structured explanation with exactly three parts:

1. **Simple Explanation**: A clear, concise explanation in 2-3 sentences that anyone can understand.
2. **Example**: A practical, real-life example that illustrates this concept in action.
3. **Article Reference**: The specific Article(s) or provisions in the Indian Constitution that relate to this topic, with a brief note about what they state.

Keep the total response under 200 words. Be accurate and educational.`;

      userPrompt = `Topic: ${topic}
Context: This topic is part of "${levelTitle}" in learning about the Indian Constitution.

Please explain this topic with:
1. A simple explanation
2. A practical example
3. Relevant Article references`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: type === 'evaluate-explanation' ? 600 : 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (type === 'evaluate-explanation') {
      // Parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error('No JSON found in response');
      } catch (parseErr) {
        console.error('Failed to parse evaluation:', parseErr);
        // Return a default response if parsing fails
        return new Response(JSON.stringify({
          score: 5,
          overall: 'Good attempt! Keep practicing to improve.',
          strengths: ['You made an effort to explain the concept'],
          improvements: ['Try to be more specific about the constitutional provisions'],
          correctExplanation: content,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ explanation: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in explain-topic function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
