import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the Constitution Escape Room Game Master for the Indian Constitution. You create engaging puzzle-based challenges where players must solve constitutional clues to "unlock" each room.

Your role is to:
1. Generate creative, educational puzzles about the Indian Constitution
2. Create immersive escape room scenarios with constitutional themes
3. Provide hints that guide without giving away answers
4. Teach constitutional concepts through engaging gameplay

Always respond in valid JSON format as specified in the user's request.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAIAPIKEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body = await req.json();
    const { action, level, lockType, roomNumber, userAnswer, correctAnswer, puzzle } = body;

    let prompt = '';

    if (action === 'generate_puzzle') {
      prompt = `Generate an escape room puzzle for the Indian Constitution game.

Room Level: ${level} (${getLevelDescription(level)})
Lock Type: ${lockType}
Room Number: ${roomNumber}

Based on the lock type, create an appropriate puzzle:
- "article": Create a riddle about a specific constitutional article
- "case": Reference a landmark Supreme Court case
- "timeline": Test knowledge of constitutional history/amendments chronology

IMPORTANT: Make the puzzle appropriate for the difficulty level:
- Beginner: Basic fundamental rights, well-known articles (14-32)
- Intermediate: Directive Principles, Fundamental Duties, less common articles
- Advanced: Complex constitutional provisions, landmark cases, amendments
- Expert: Intricate constitutional law, multiple case references, obscure provisions

Respond ONLY with valid JSON in this exact format:
{
  "puzzle": "The riddle or clue text that the player must solve",
  "correct_answer": "The exact answer (e.g., 'Article 21' or 'Kesavananda Bharati Case')",
  "hint_1": "A soft hint that nudges towards the answer",
  "hint_2": "A stronger hint that makes the answer more obvious",
  "learning_point": "Educational explanation of the constitutional concept",
  "room_theme": "Brief description of the escape room setting for this puzzle",
  "lock_description": "Description of the lock that needs to be opened"
}`;
    } else if (action === 'verify_answer') {
      prompt = `A player in the Constitution Escape Room game provided an answer.

Puzzle: ${puzzle}
Correct Answer: ${correctAnswer}
Player's Answer: ${userAnswer}

Evaluate if the player's answer is correct or close enough to be accepted (allowing for minor variations in phrasing).

Respond ONLY with valid JSON:
{
  "is_correct": true/false,
  "feedback": "Encouraging feedback about their answer",
  "explanation": "Brief explanation of why the answer is correct/incorrect",
  "partial_credit": true/false (if answer shows partial understanding)
}`;
    } else if (action === 'generate_room') {
      prompt = `Create a complete escape room experience for the Indian Constitution game.

Level: ${level}
Room Number: ${roomNumber}

Generate a themed escape room with 3 connected puzzles that the player must solve in sequence to escape.

Respond ONLY with valid JSON:
{
  "room_name": "Creative name for the escape room",
  "room_story": "Brief backstory setting up the escape room scenario (2-3 sentences)",
  "puzzles": [
    {
      "lock_type": "article",
      "puzzle": "First puzzle/riddle",
      "correct_answer": "Answer",
      "hint_1": "Soft hint",
      "hint_2": "Strong hint",
      "learning_point": "What you learn",
      "lock_description": "The first lock description"
    },
    {
      "lock_type": "case",
      "puzzle": "Second puzzle/riddle",
      "correct_answer": "Answer",
      "hint_1": "Soft hint",
      "hint_2": "Strong hint",
      "learning_point": "What you learn",
      "lock_description": "The second lock description"
    },
    {
      "lock_type": "timeline",
      "puzzle": "Third puzzle/riddle",
      "correct_answer": "Answer",
      "hint_1": "Soft hint",
      "hint_2": "Strong hint",
      "learning_point": "What you learn",
      "lock_description": "The final lock description"
    }
  ],
  "escape_message": "Congratulatory message when they escape"
}`;
    }

    console.log('Calling OpenAI API with prompt for action:', action);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('OpenAI response:', content);

    // Parse the JSON response
    let parsedContent;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in escape-room function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getLevelDescription(level: string): string {
  switch (level) {
    case 'beginner':
      return 'Basic constitutional knowledge - Fundamental Rights focus';
    case 'intermediate':
      return 'Moderate difficulty - Directive Principles and detailed articles';
    case 'advanced':
      return 'Complex scenarios - Landmark cases and amendments';
    case 'expert':
      return 'Constitutional Expert - Intricate provisions and multiple case references';
    default:
      return 'Standard difficulty';
  }
}
