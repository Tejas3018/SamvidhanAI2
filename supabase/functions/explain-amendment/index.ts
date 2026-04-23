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
    const { amendment, mode } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    
    switch (mode) {
      case 'simple':
        systemPrompt = `You are a constitutional law expert. Explain the following Indian Constitutional Amendment in simple, everyday English. Use short sentences and avoid legal jargon. Keep the explanation under 100 words.`;
        break;
      case 'eli12':
        systemPrompt = `You are a friendly teacher explaining the Indian Constitution to a 12-year-old. Use simple words, relatable examples, and make it fun and easy to understand. Keep the explanation under 100 words.`;
        break;
      case 'reallife':
        systemPrompt = `You are a constitutional law expert. Provide a real-life practical example of how this Indian Constitutional Amendment affects everyday citizens. Use a specific, relatable scenario. Keep it under 100 words.`;
        break;
      default:
        systemPrompt = `Explain this Indian Constitutional Amendment clearly and concisely in under 100 words.`;
    }

    const userPrompt = `Amendment: ${amendment.number} - ${amendment.title}
Summary: ${amendment.summary}
Impact: ${amendment.impact}
Year: ${amendment.year}
Category: ${amendment.category}`;

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
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in explain-amendment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
